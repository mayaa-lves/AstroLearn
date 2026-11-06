/* Adaptador da interface para o backend real. Sem dados escolares de exemplo. */
(() => {
  const ready = import("../services/conexao.js");
  const call = async (path, method = "GET", data) => {
    const c = await ready;
    c.sessaoObrigatoria("professor");
    return c.api(path, method, data);
  };
  const comunicacao = import("../services/comunicacao.js");
  const atividades = import("../services/atividades.js");
  const part = (x) => encodeURIComponent(String(x));
  const base = (s) => "/api/professor/salas/" + part(s);
  const blocked = async (feature) => (await ready).indisponivel(feature);
  const normalize = (m) => ({
    ...m,
    status_publicacao: (m.status || m.status_publicacao) === "publicada" || m.status_publicacao === "publicado" ? "publicado" : "rascunho",
    tipo_atividade: m.modalidade || m.tipo_atividade || "individual",
  });
  const enriched = (e) => ({
    ...e,
    missoes: e.missoes || { id: e.missao_id, titulo: e.titulo_missao },
    resposta_entrega: e.texto_entrega || "",
    anexos: e.anexos || [],
  });
  async function room(s) {
    const [d, p, e] = await Promise.all([
      call(base(s)),
      call(base(s) + "/pauta"),
      call(base(s) + "/entregas"),
    ]);
    return {
      ...d,
      missoes: (d.missoes || []).map(normalize),
      pauta: p,
      entregas: (e.entregas || []).map(enriched),
    };
  }
  async function payload(s, b, existing) {
    const d = await call(base(s));
    const periodo = b.periodo_id || null;
    const same = (d.missoes || []).filter(m => (m.periodo_id || null) === periodo && m.id !== existing?.id);
    const ordem = (existing?.periodo_id || null) === periodo && existing?.ordem
      ? existing.ordem : Math.max(0, ...same.map(m => Number(m.ordem) || 0)) + 1;
    const body = {
      titulo: b.titulo,
      descricao: b.descricao || "",
      o_que_entregar: b.o_que_entregar || "",
      periodo_id: periodo,
      modalidade: b.tipo_atividade || b.modalidade || existing?.modalidade || "individual",
      status: b.status || (b.status_publicacao === "publicado" ? "publicada" : b.status_publicacao === "rascunho" ? "rascunho" : existing?.status || "rascunho"),
      ordem,
      data_limite: b.data_limite || null,
      peso_nota: b.peso_nota,
      xp_reward: b.xp_reward,
      sticker_recompensa_id: existing?.sticker_recompensa_id || null,
    };
    if (!b.anexo) return body;
    const rules = await atividades;
    rules.validarArquivos([b.anexo], 1);
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => form.append(key, value == null ? "" : String(value)));
    form.append("anexo", b.anexo, b.anexo.name);
    return form;
  }
  async function mission(s, m) {
    const d = await call(base(s));
    const old = d.missoes.find(a => a.id === m);
    if (!old) throw Error("Atividade não encontrada nesta turma.");
    return old;
  }
  window.TeacherData = {
    live: true,
    uid: () => crypto.randomUUID(),
    session: async () => (await ready).sessaoObrigatoria("professor"),
    editorReady: async () => true,
    rooms: () => call("/api/professor/salas"),
    room,
    createRoom: (nome) => call("/api/professor/salas", "POST", { nome }),
    createPeriod: (s, nome) => call(base(s) + "/periodos", "POST", { nome }),
    async createMission(s, b) {
      return normalize(
        await call(base(s) + "/missoes", "POST", await payload(s, b)),
      );
    },
    async updateMission(s, m, b) {
      const d = await call(base(s));
      const old = d.missoes.find((a) => a.id === m);
      if (!old) throw Error("Atividade não encontrada.");
      return normalize(
        await call(
          base(s) + "/missoes/" + part(m),
          "PUT",
          await payload(s, b, old),
        ),
      );
    },
    async publishMission(s, m) {
      const old = await mission(s, m);
      return this.updateMission(s, m, { ...old, status: "publicada" });
    },
    async uploadRules() {
      const r = await atividades;
      return { accept: r.ACCEPT_ARQUIVOS, aviso: r.AVISO_UPLOAD };
    },
    async validateFiles(files, max = 1) { return (await atividades).validarArquivos(files, max); },
    async files(s, m) {
      const old = await mission(s, m);
      if (!old.anexo_url) return [];
      const r = await atividades;
      return [r.normalizarAnexo({ url: old.anexo_url, nome_arquivo: "Material da atividade." + old.anexo_url.split('?')[0].split('.').pop(), path: old.anexo_url })];
    },
    async attach(s, m, files) {
      const lista = await this.validateFiles(files, 1);
      if (!lista.length) throw Error("Escolha um arquivo.");
      const old = await mission(s, m);
      return this.updateMission(s, m, { ...old, anexo: lista[0] });
    },
    removeFile: () => blocked("A exclusão de anexos"),
    team: async (s, t) => {
      const route=base(s)+"/equipes/"+part(t);
      const [detail,tasks,notes]=await Promise.all([call(route),call(route+"/tarefas"),call(route+"/avisos")]);
      return {...detail,tarefas:tasks.tarefas || [],avisos:notes.avisos || []};
    },
    createTeam: (s, b) =>
      call(base(s) + "/equipes", "POST", {
        nome: b.nome,
        periodo_id: b.periodo_id,
      }),
    addMember: (s, t, a) =>
      call(base(s) + "/equipes/" + part(t) + "/membros", "POST", {
        aluno_id: a,
      }),
    removeMember: (s, t, a) =>
      call(base(s) + "/equipes/" + part(t) + "/membros/" + part(a), "DELETE"),
    async delivery(e) {
      const d = await call("/api/professor/entregas/" + part(e));
      return {
        ...enriched(d.progresso),
        anexos: (d.anexos || []).map((await atividades).normalizarAnexo),
        sala_id: d.sala_id,
        equipe: d.equipe,
        membros: d.membros,
      };
    },
    correct: (e, nota, feedback) =>
      call("/api/professor/entregas/" + part(e) + "/corrigir", "POST", {
        nota,
        feedback_professor: feedback,
      }),
    notifications: async () => {const d=await (await comunicacao).notificacoes(); return {...d,notificacoes:(d.notificacoes || []).map(n=>({...n,tipo:n.tipo==="duvida"?"pergunta":n.tipo,entrega_id:n.progresso_id}))};},
    readNotifications: async ids => (await comunicacao).lerNotificacoes(ids),
    simulateDelivery: () => blocked("A simulação de entrega"),
    questions: async s => (await call(base(s)+"/perguntas")).perguntas || [],
    studentQuestions: () => blocked("As perguntas ao professor"),
    ask: () => blocked("As perguntas ao professor"),
    answer: (id,resposta) => call("/api/professor/perguntas/"+part(id)+"/responder","POST",{resposta}),
    demoSubmission: () => blocked("A entrega de texto e arquivos"),
    demoStudentWork: () => blocked("O modo de demonstração"),
    library: (s) => call(base(s) + "/biblioteca"),
    createMaterial: (s, b) => call(base(s) + "/biblioteca", "POST", b),
  };
})();
