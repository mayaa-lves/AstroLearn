(() => {
  "use strict";

  const e = window.TeacherData;
  const a = id => document.getElementById(id);
  const t = new URLSearchParams(location.search);
  const o = document.body.dataset.page;
  const i = t.get("sala");

  let n = null;
  let r = [];
  let s = null;
  let d = false;
  let l = 0;

  const p = [];

  const c = (tag, texto = "", classe = "") => {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;
    elemento.className = classe;
    return elemento;
  };

  const u = (elemento, ...filhos) => {
    elemento.append(...filhos);
    return elemento;
  };

  const m = (rota, valores = {}) => {
    const query = new URLSearchParams(valores);

    if (valores.sala && t.get("periodo")) {
      query.set("periodo", t.get("periodo"));
    }

    const rotas = {
      "": "home.html",
      "sala/": "turma.html",
      "aluno/": "aluno.html",
      "atividade/": "atividade.html",
      "atividade/nova/": "editor-atividade.html",
      "atividade/editar/": "editor-atividade.html",
      "atividades/": "atividades.html",
      "biblioteca/": "biblioteca.html",
      "equipes/": "equipes.html",
      "correcoes/": "correcoes.html",
      "correcao/": "correcao.html",
      "perguntas/": "perguntas.html",
      "notificacoes/": "notificacoes.html"
    };

    return (rotas[rota] || "home.html") +
      (query.size ? "?" + query.toString() : "");
  };

  const v = (
    texto,
    rota,
    valores = {},
    classe = "secondary"
  ) => {
    const link = c("a", texto, classe);
    link.href = m(rota, valores);
    return link;
  };

  const g = (texto, acao, classe = "secondary") => {
    const botao = c("button", texto, classe);
    botao.type = "button";
    botao.onclick = acao;
    return botao;
  };

  const h = erro => {
    a("error").textContent = erro.message || String(erro);
  };

  const f = valor => {
    // A pauta atual retorna {nota, nota_origem}; versões antigas retornavam
    // o número diretamente. O mesmo leitor alimenta gráficos e filtros.
    if (valor !== null && typeof valor === "object") {
      return f(valor.nota);
    }

    if (
      valor === null ||
      valor === undefined ||
      valor === ""
    ) {
      return null;
    }

    return Number.isFinite(Number(valor))
      ? Number(valor)
      : null;
  };

  const b = valor => valor === null
    ? "—"
    : Number(valor).toLocaleString(
        "pt-BR",
        { maximumFractionDigits: 1 }
      );

  const w = (titulo, subtitulo) => {
    a("pageTitle").textContent = titulo;
    a("pageSubtitle").textContent = subtitulo;
    document.title = titulo + " · AstroLearn";
  };

  const y = (titulo, subtitulo = "") => {
    const painel = c("section", "", "panel");

    painel.append(c("h2", titulo));

    if (subtitulo) {
      painel.append(c("p", subtitulo));
    }

    return painel;
  };

  const x = (titulo, valor) => u(
    c("div", "", "card stat"),
    c("span", titulo),
    c("strong", valor)
  );

function A() { p.splice(0).forEach(e => URL.revokeObjectURL(e)) }
function C(e, t) { s = document.activeElement, a("dialogTitle").textContent = e, a("dialogContent").replaceChildren(t), a("dialogError").textContent = "", a("actionDialog").showModal() }
async function E(e) { if (!d) { d = !0, a("closeDialog").disabled = !0; try { await e() } catch (e) { a("dialogError").textContent = e.message } finally { d = !1, a("closeDialog").disabled = !1 } } }
function _(a, t, o = "text", i = "", n = "") { const r = `field-${i || e.uid()}`, s = c("label", t); s.htmlFor = r; const d = c("textarea" === o ? "textarea" : "select" === o ? "select" : "input"); return d.id = r, d.name = i, "textarea" !== o && "select" !== o && (d.type = o), d.value = n, "textarea" === o && (d.rows = 5), a.append(s, d), d }
function q(e, a, t) { const o = c("option", a); o.value = t, e.append(o) }
function S(e, a) { const t = c("div", "", "table-wrap"), o = c("table"), i = c("thead"), n = c("tr"); e.forEach(e => { const a = c("th", e); a.scope = "col", n.append(a) }), i.append(n), o.append(i); const r = c("tbody"); return a.forEach(e => { const a = c("tr"); e.forEach(e => { const t = c("td"); t.append(e instanceof Node ? e : document.createTextNode(String(e))), a.append(t) }), r.append(a) }), o.append(r), t.append(o), t }
function N(e, a, t) { const o = y(e, t); return a.forEach((e, a) => { const t = c("div", "", "bar-row"), i = c("div", "", "bar-track"), n = c("div", "", "bar-fill"); n.style.width = Math.max(0, Math.min(100, e.percent || 0)) + "%", n.setAttribute("aria-hidden", "true"), i.append(n), t.append(c("span", e.label), i, c("strong", String(e.value))), o.append(t) }), o }
function M(e, a, t = "Escala de 0 a 10. Atividades sem nota permanecem sem ponto.") {
  const o = y(e, t); o.classList.add("chart");
  const i = "http://www.w3.org/2000/svg", n = document.createElementNS(i, "svg");
  n.setAttribute("viewBox", "0 0 620 210"), n.setAttribute("role", "img"), n.setAttribute("aria-label", e + ". " + a.map((e, a) => `Atividade ${a + 1}: ${null == e.value ? "sem nota" : b(e.value)}`).join("; ")), n.classList.add("chart-svg");
  const r = (e, a) => { const t = document.createElementNS(i, e); return Object.entries(a).forEach(([e, a]) => t.setAttribute(e, a)), t };
  [0, 5, 10].forEach(e => { const a = 175 - 15 * e; n.append(r("line", { x1: 38, x2: 595, y1: a, y2: a, class: "grid" })); const t = r("text", { x: 15, y: a + 4 }); t.textContent = e, n.append(t) });
  let s = null;
  a.forEach((e, t) => { const o = a.length < 2 ? 315 : 48 + 535 * t / (a.length - 1), i = f(e.value); if (null != i) { const a = 175 - 15 * Math.max(0, Math.min(10, i)); s && n.append(r("line", { x1: s.x, y1: s.y, x2: o, y2: a, class: "trend" })); const t = r("circle", { cx: o, cy: a, r: 5 }), d = r("title", {}); d.textContent = `${e.label}: ${b(i)}`, t.append(d), n.append(t), s = { x: o, y: a } } else s = null; const d = r("text", { x: o, y: 199, "text-anchor": "middle" }); d.textContent = t + 1, n.append(d) });
  o.append(n);
  const d = c("details");
  return d.append(c("summary", "Ver atividades e valores"), S(["Atividade", "Nota"], a.map(e => [e.label, b(f(e.value))]))), o.append(d), a.some(e => null != f(e.value)) || o.append(c("p", "Ainda não há notas registradas para este gráfico.", "chart-caption")), o
}
function R(e) {
  const a = new Set(e.missoes.filter(e => "rascunho" !== e.status_publicacao).map(e => e.id)), t = new Set(e.alunos.map(e => e.id)), o = new Map;
  for (const i of e.entregas) a.has(i.missao_id) && t.has(i.aluno_id || i.perfis?.id) && !o.has(`${i.aluno_id || i.perfis?.id}-${i.missao_id}`) && o.set(`${i.aluno_id || i.perfis?.id}-${i.missao_id}`, i);
  const i = [...o.values()], n = a.size * t.size, r = i.filter(e => "corrigido" === e.status).length, s = i.filter(e => "entregue" === e.status).length;
  return { total: n, corrected: r, pending: s, missing: Math.max(0, n - r - s) }
}
a("closeDialog").onclick = function () { d || a("actionDialog").close() };
a("actionDialog").addEventListener("cancel", e => { d && e.preventDefault() });
a("actionDialog").addEventListener("close", () => { s?.focus() });
const P = e => e.missoes.filter(e => "rascunho" !== e.status_publicacao);
function $(e) { return P(e).map(a => { const t = (e.pauta.pauta_data || []).map(e => f(e.notas?.[a.id])).filter(e => null !== e); return { label: (e.periodos.find(e => e.id === a.periodo_id)?.nome || "Período") + " · " + a.titulo, value: t.length ? t.reduce((e, a) => e + a, 0) / t.length : null } }) }

// Nomes únicos entre as turmas deste professor. O servidor deve garantir atomicidade.
const normalizarNomeTurma = nome => String(nome || '').normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('pt-BR');
async function criarTurmaNoMural(valor) {
  const nome = valor.normalize('NFKC').trim().replace(/\s+/gu, ' ');
  const atuais = await e.rooms();
  const turmas = Array.isArray(atuais) ? atuais : atuais.salas;
  if (!Array.isArray(turmas)) throw new Error('Não foi possível conferir os nomes das turmas. Tente novamente.');
  if (turmas.some(turma => normalizarNomeTurma(turma.nome) === normalizarNomeTurma(nome))) {
    throw new Error('Você já tem uma turma com esse nome. Escolha outro nome.');
  }
  const nova = await e.createRoom(nome);
  a('actionDialog').close();
  await G();
  const card = [...document.querySelectorAll('.room-card')].find(card => card.dataset.roomId === String(nova?.id));
  a('status').textContent = 'Turma criada! Clique em Entrar na turma quando quiser abrir a sala.';
  if (card) {
    card.classList.add('room-just-created');
    card.tabIndex = -1;
    card.focus({preventScroll:true});
    card.scrollIntoView({block:'nearest',behavior:'instant'});
  } else if (a('error').textContent) {
    a('status').textContent = 'Turma criada, mas não foi possível atualizar o mural. Use Atualizar para consultar os cards.';
  }
}

let buscaTurma = '';
async function L(token) {
  w('Suas turmas', 'Acompanhe suas turmas e as próximas descobertas.');
  a('pageActions').append(g('+ Criar turma', () => z('Criar turma', 'Nome da turma', criarTurmaNoMural), 'primary teacher-create-room'));
  document.getElementById('roomToolbar')?.remove();
  const toolbar=c('div','','room-toolbar');toolbar.id='roomToolbar';
  const search=c('div','','room-search'),toggle=g('','', 'room-search-toggle');
  toggle.onclick=()=>{search.classList.add('is-open');input.focus();};
  toggle.setAttribute('aria-label','Buscar turma');toggle.setAttribute('aria-controls','roomSearch');
  toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg>';
  const input=c('input');input.id='roomSearch';input.type='search';input.placeholder='Buscar turma';input.setAttribute('aria-label','Buscar turma por nome ou código');input.value=buscaTurma;
  search.classList.toggle('has-value',!!buscaTurma);
  input.onkeydown=event=>{if(event.key==='Escape'){input.value='';buscaTurma='';filtrar();search.classList.remove('is-open');toggle.focus();}};
  search.addEventListener('focusout',()=>{setTimeout(()=>{if(!search.contains(document.activeElement))search.classList.remove('is-open');},0);});
  const count=c('span','','room-count');count.setAttribute('role','status');
  search.append(toggle,input);toolbar.append(search,count);a('content').before(toolbar);
  const data=await Promise.all(r.map(async room=>({room,data:await e.room(room.id)})));
  if(token!==l)return;
  const grid=c('div','','room-grid');
  data.forEach(({room,data},index)=>{
    const card=c('article','','card room-card');card.dataset.roomId=String(room.id);card.dataset.planetFamily=String(index%6);
    card.dataset.search=normalizarNomeTurma(room.nome+' '+(room.codigo_acesso||data.sala?.codigo_acesso||''));
    const top=c('div','','room-art'),identity=c('div','','room-identity');
    const heading=c('h2',room.nome);heading.title=room.nome;identity.append(heading,c('small','TURMA','room-code-label'));
    const code=room.codigo_acesso||data.sala?.codigo_acesso;
    const codeRow=c('div','','room-code-row');codeRow.append(c('strong',code||'Indisponível'));
    if(code){const copy=g('','', 'room-copy');copy.setAttribute('aria-label','Copiar código da turma '+room.nome);copy.title='Copiar código';copy.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="7" width="12" height="14" rx="2"/><path d="M15 7V3H4v14h4"/></svg>';copy.onclick=async()=>{try{await navigator.clipboard.writeText(code);a('status').textContent='Código copiado.';}catch{a('status').textContent='Não foi possível copiar. Código da turma: '+code;}};codeRow.append(copy);}
    identity.append(codeRow);const planet=c('div','','room-planet');planet.setAttribute('aria-hidden','true');top.append(identity,planet);
    const metrics=c('div','','room-metrics');metrics.append(u(c('div'),c('strong',String(data.alunos.length)),c('span','Alunos')),u(c('div'),c('strong',String(P(data).length)),c('span','Atividades')));
    const pending=R(data).pending,foot=c('div','','room-card-footer');
    const state=c('p',pending?`${pending} ${pending===1?'entrega para corrigir':'entregas para corrigir'}`:'Correções em dia','room-state '+(pending?'pending':'done'));
    const icon=c('span',pending?'•':'✓','room-state-icon');icon.setAttribute('aria-hidden','true');state.prepend(icon);
    const enter=v('Abrir turma','sala/',{sala:room.id},'room-enter');enter.setAttribute('aria-label','Abrir turma '+room.nome);const arrow=c('span');arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 24 24" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';enter.append(arrow);foot.append(state,enter);card.append(top,metrics,foot);grid.append(card);
  });
  const empty=c('p',r.length?'Nenhuma turma encontrada.':'Você ainda não tem turmas. Crie sua primeira turma.','empty room-search-empty');
  a('content').append(grid,empty);
  function filtrar(){const term=normalizarNomeTurma(input.value);buscaTurma=input.value;search.classList.toggle('has-value',!!term);let shown=0;for(const card of grid.children){card.hidden=!card.dataset.search.includes(term);if(!card.hidden)shown++;}count.textContent=term?`${shown} de ${r.length} turmas`:`${r.length} ${r.length===1?'turma':'turmas'}`;empty.hidden=shown>0;}
  input.oninput=filtrar;filtrar();
}

function z(e, a, t) {
  const o = c("form"), i = _(o, a); i.required = !0, i.maxLength = 80;
  const n = c("button", "Confirmar", "primary"); n.type = "submit";
  o.append(c("p", "Os dados serão salvos no servidor para esta turma.", "hint"), n);
  o.onsubmit = e => { e.preventDefault(), i.value.trim() && E(async () => { n.disabled = !0; try { await t(i.value.trim()) } finally { n.disabled = !1 } }) };
  C(e, o)
}
function D() {
  const e = a("breadcrumbs");
  e.replaceChildren(v("Turmas", "", {}, ""));
  n && (e.append(c("span", "/"), v(n.sala.nome, "sala/", { sala: i }, "")), "room" !== o && e.append(c("span", "/"), c("span", { notifications: "Notificações", student: "Aluno", activities: "Atividades", activity: "Atividade", create: "Nova atividade", teams: "Equipes", corrections: "Correções", review: "Corrigir entrega", questions: "Perguntas" }[o])))
}
function T() {
  w(n.sala.nome, "Uma visão da turma para orientar a próxima descoberta.");
  a("pageActions").append(v("+ Criar atividade", "atividade/nova/", { sala: i }, "primary"), v("Organizar equipes", "equipes/", { sala: i }), v("Revisar entregas", "correcoes/", { sala: i }));
  const t = R(n);
  a("content").append(u(c("section", "", "stats"), x("Alunos cadastrados", n.alunos.length), x("Atividades publicadas", P(n).length), x("Aguardando correção", t.pending)));
  const o = c("div", "", "two-columns"), r = y("Alunos cadastrados", "Abra o aluno para consultar notas, entregas e seu desenvolvimento."), s = c("input");
  s.type = "search", s.placeholder = "Buscar aluno…", s.setAttribute("aria-label", "Buscar aluno da turma");
  const d = c("div"); r.id = "alunos", r.append(s, d);
  const l = () => {
    const e = s.value.toLocaleLowerCase("pt-BR"), a = n.alunos.filter(a => a.nome.toLocaleLowerCase("pt-BR").includes(e));
    d.replaceChildren(S(["Aluno", "Média de atividades", "Entregas", ""], a.map(e => {
      const a = n.pauta.pauta_data.find(a => a.aluno.id === e.id), t = n.entregas.filter(a => (a.aluno_id || a.perfis?.id) === e.id);
      return [u(c("div", "", "cell-name"), c("span", e.nome.slice(0, 1), "initial"), c("span", e.nome)), b(f(a?.media_missoes ?? a?.media)), `${t.length}/${P(n).length}`, v("Ver aluno →", "aluno/", { sala: i, aluno: e.id }, "")]
    }))), a.length || d.append(c("p", "Nenhum aluno encontrado.", "empty"))
  };
  s.oninput = l, l();
  const p = c("div", "", "stack");
  p.append(M("Notas da turma por atividade", $(n), "Média apenas das notas registradas em cada atividade. Escala de 0 a 10."), function (e) {
    const a = R(e), t = a.total || 1;
    return N("Situação das atividades", [{ label: "Corrigidas", value: a.corrected, percent: a.corrected / t * 100 }, { label: "A corrigir", value: a.pending, percent: a.pending / t * 100 }, { label: "Sem entrega", value: a.missing, percent: a.missing / t * 100 }], "Contagem por aluno e atividade cadastrada. Inclui atividades futuras; não representa atraso.")
  }(n));
  o.append(r, p), a("content").append(o);
  const m = c("div", "", "room-code");
  m.append(c("span", "Código da turma"), c("strong", n.sala.codigo_acesso || "—"), g("Copiar código", async () => { try { await navigator.clipboard.writeText(n.sala.codigo_acesso), a("status").textContent = "Código copiado." } catch { a("status").textContent = "Selecione o código para copiá-lo." } }, "text-button"), g("+ Criar período", () => z("Criar período", "Nome do período", async t => { await e.createPeriod(i, t), a("actionDialog").close(), await G() }), "text-button"));
  a("content").append(m)
}
function O() {
  const e = t.get("aluno"), o = n.alunos.find(a => a.id === e);
  if (!o) throw new Error("Este aluno não pertence à turma selecionada.");
  w(o.nome, "Acompanhamento individual: atividades, notas e retorno do professor.");
  const r = n.pauta.pauta_data.find(a => a.aluno.id === e), s = n.entregas.filter(a => (a.aluno_id || a.perfis?.id) === e), d = s.filter(e => "corrigido" === e.status);
  a("content").append(u(c("section", "", "stats"), x("Média das atividades", b(f(r?.media_missoes ?? r?.media))), x("Entregas registradas", `${s.length}/${P(n).length}`), x("Atividades corrigidas", d.length)));
  const l = P(n).map(e => ({ label: (n.periodos.find(a => a.id === e.periodo_id)?.nome || "Período") + " · " + e.titulo, value: f(r?.notas?.[e.id]) })), p = c("div", "", "two-columns");
  p.append(M("Notas por atividade", l), N("Situação individual", [{ label: "Corrigidas", value: d.length, percent: d.length / (P(n).length || 1) * 100 }, { label: "A corrigir", value: s.filter(e => "entregue" === e.status).length, percent: s.filter(e => "entregue" === e.status).length / (P(n).length || 1) * 100 }, { label: "Sem entrega", value: Math.max(0, P(n).length - s.length), percent: Math.max(0, P(n).length - s.length) / (P(n).length || 1) * 100 }], "Atividades sem avaliação não entram na média."));
  a("content").append(p);
  const m = y("Histórico de atividades", "A nota e a orientação pertencem a cada atividade, não a um rótulo do aluno.");
  m.style.marginTop = "20px";
  m.append(S(["Atividade", "Situação", "Nota", "Retorno", ""], P(n).map(e => {
    const a = s.find(a => a.missao_id === e.id);
    return [e.titulo, a ? "corrigido" === a.status ? "Corrigida" : "A corrigir" : "Sem entrega", b(f(a?.nota)), a?.comentario_professor || "—", a ? v("Abrir entrega", "correcao/", { sala: i, entrega: a.id }, "text-button") : "—"]
  })));
  a("content").append(m)
}
function B() {
  w("Atividades da turma.", "Rascunhos para preparar. Publicadas para os alunos descobrirem.");
  a("pageActions").append(v("+ Criar atividade", "atividade/nova/", { sala: i }, "primary"));
  const e = c("select");
  e.setAttribute("aria-label", "Situação da atividade"), q(e, "Todas as atividades", ""), q(e, "Rascunhos", "rascunho"), q(e, "Publicadas", "publicado"), a("pageActions").append(e);
  const t = c("div", "", "list"); a("content").append(t);
  const o = () => {
    t.replaceChildren();
    for (const a of n.missoes.filter(a => !e.value || (a.status_publicacao || "publicado") === e.value)) {
      const e = "rascunho" === a.status_publicacao, o = c("article", "", "list-card"), r = c("div");
      r.append(c("span", e ? "Rascunho" : "Publicada", e ? "badge" : "badge green"), c("h2", a.titulo), c("p", `${n.periodos.find(e => e.id === a.periodo_id)?.nome || "Sem período"} · ${"equipe" === a.tipo_atividade ? "Em equipe" : "Individual"} · Atividade ${a.ordem}${a.data_limite ? " · Prazo " + new Date(a.data_limite.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR") : ""}`));
      o.append(r, v(e ? "Continuar rascunho →" : "Abrir atividade →", e ? "atividade/editar/" : "atividade/", { sala: i, atividade: a.id })), t.append(o)
    }
    t.children.length || t.append(c("p", "Nenhuma atividade corresponde a este filtro.", "empty"))
  };
  e.onchange = o, o()
}
function k(e) {
  const a = c("a", e.name || "Arquivo");
  if (e.blob instanceof Blob) a.href = URL.createObjectURL(e.blob), p.push(a.href), a.download = e.name;
  else try { const t = new URL(e.url); if ("https:" !== t.protocol) return null; a.href = t.href, a.target = "_blank", a.rel = "noopener noreferrer" } catch { return null }
  return a
}
a("menuToggle").onclick = () => {
  const e = document.body.classList.toggle("collapsed");
  a("menuToggle").setAttribute("aria-expanded", String(!e)), a("menuToggle").setAttribute("aria-label", e ? "Expandir menu" : "Recolher menu")
};
a("help").onclick = () => {
  const e = c("div");
  e.append(c("p", "Comece em Turmas. Ao abrir uma sala, consulte os alunos e gráficos. Use Atividades para criar uma proposta com PDF ou imagem, Equipes para organizar os grupos e Correções para revisar as entregas."), c("p", "Os gráficos mostram apenas dados registrados. Sem nota significa que a atividade ainda não recebeu uma avaliação."), c("p", "Turmas, atividades e correções são salvas na sua conta pelo servidor."));
  C("Sua estação de aprendizagem", e)
};
a("exit").onclick = async e => { e.preventDefault(), location.assign("../auth/login.html") };
a("topExit").onclick = () => a("exit").click();
let j = !1;
const I = e => "../aluno/atividade.html?" + new URLSearchParams({ preview: "1", sala: i, atividade: e.id });

async function V() {
  await e.editorReady();
  const activityId = t.get('atividade') || t.get('criada');
  let mission = activityId ? n.missoes.find(item => item.id === activityId) : null;
  if (activityId && !mission) throw new Error('Atividade não encontrada nesta turma.');
  const rules = await e.uploadRules();
  let selected = null, saving = false;
  w(mission ? 'Preparar a próxima descoberta.' : 'Uma nova descoberta.',
    mission?.status_publicacao === 'publicado' ? 'As alterações salvas ficam visíveis para os alunos.' : 'Salve a proposta como rascunho e publique quando estiver pronta.');
  a('pageActions').append(v('← Atividades da turma', 'atividades/', { sala: i }));
  const grid = c('div', '', 'editor-grid'), panel = y('Proposta da atividade'), form = c('form');
  form.id = 'missionForm'; panel.classList.add('form-panel'); panel.append(form);
  const title = _(form, 'Título da atividade', 'text', 'mission-title', mission?.titulo || '');
  title.required = true; title.maxLength = 120;
  const description = _(form, 'Orientação para os alunos', 'textarea', 'mission-description', mission?.descricao || '');
  description.maxLength = 10000; description.rows = 7;
  const deliverable = _(form, 'O que entregar?', 'textarea', 'mission-deliverable', mission?.o_que_entregar || '');
  deliverable.maxLength = 10000; deliverable.rows = 4;
  deliverable.placeholder = 'Ex.: um relatório com a hipótese, fotos do experimento e a conclusão.';
  const row = c('div', '', 'form-row');
  const period = _(row, 'Período', 'select', 'mission-period');
  n.periodos.forEach(item => q(period, item.nome, item.id));
  period.value = mission?.periodo_id || t.get('periodo') || n.periodos[0]?.id || ''; period.required = true;
  const date = _(row, 'Prazo de entrega (opcional)', 'date', 'mission-date', mission?.data_limite?.slice(0, 10) || '');
  form.append(row);
  const mode = _(form, 'Formato da proposta', 'select', 'mission-mode');
  q(mode, 'Individual', 'individual'); q(mode, 'Em equipe', 'equipe'); mode.value = mission?.tipo_atividade || 'individual';
  const modeHint = c('p', '', 'hint');
  const teamLink = v('Organizar equipes deste período →', 'equipes/', { sala: i }, 'text-button');
  form.append(modeHint, teamLink);
  const rewards = c('details', '', 'orientation'); rewards.append(c('summary', 'Nota e recompensas'));
  const scores = c('div', '', 'form-row');
  const weight = _(scores, 'Peso da nota', 'number', 'mission-weight', mission?.peso_nota ?? 1);
  const xp = _(scores, 'XP da atividade', 'number', 'mission-xp', mission?.xp_reward ?? 30);
  weight.min = '.1'; weight.max = '10'; weight.step = '.1'; xp.min = '0'; xp.max = '1000'; xp.step = '1';
  rewards.append(scores, c('p', 'Até 5 atividades por período. A ordem é definida automaticamente.', 'hint')); form.append(rewards);
  const materials = c('div', '', 'editor-materials');
  materials.append(c('h2', 'Material de apoio'), c('p', 'Um anexo por atividade. Para compartilhar outros materiais, use a biblioteca da turma.', 'hint'));
  const fileList = c('ul', '', 'files-list'), fileInput = _(materials, 'Escolher ou substituir o anexo', 'file', 'mission-files');
  fileInput.accept = rules.accept; fileInput.multiple = false;
  materials.append(fileList, c('p', rules.aviso + ' PDF, imagens JPG/PNG, DOCX, PPTX, XLSX, ZIP, TXT, PY ou IPYNB.', 'hint'));
  form.append(materials);
  const status = c('p', '', 'file-note'), error = c('p', '', 'error-panel');
  status.setAttribute('role', 'status'); error.setAttribute('role', 'alert'); form.append(status, error);
  const actions = c('div', '', 'editor-actions');
  const save = c('button', 'Salvar rascunho', 'secondary'), preview = c('button', 'Ver como aluno', 'secondary'), publish = c('button', 'Revisar e publicar', 'primary');
  save.type = 'submit'; preview.type = publish.type = 'button';
  save.id = 'saveDraft'; preview.id = 'previewMission'; publish.id = 'publishMission'; actions.append(save, preview, publish); form.append(actions);
  const summary = y('Antes de compartilhar.', 'Uma proposta clara ajuda o aluno a começar.'); summary.classList.add('editor-summary');
  const badge = c('span', '', 'badge'), summaryTitle = c('h3'), summaryLines = c('div', '', 'editor-summary-lines');
  summary.append(badge, summaryTitle, summaryLines, c('p', 'Rascunhos ficam bloqueados na trilha, sem mostrar o conteúdo. A entrega e a nota em equipe valem para os integrantes do período.', 'hint'));
  grid.append(panel, summary); a('content').append(grid);
  function update() {
    const published = mission?.status_publicacao === 'publicado', team = mode.value === 'equipe';
    badge.textContent = published ? 'Publicada' : 'Rascunho'; badge.className = published ? 'badge green' : 'badge';
    save.textContent = published ? 'Salvar alterações' : 'Salvar rascunho'; publish.hidden = published;
    summaryTitle.textContent = title.value.trim() || 'Sua próxima atividade';
    summaryLines.replaceChildren(c('p', team ? 'Em equipe · uma entrega compartilhada' : 'Entrega individual'), c('p', n.periodos.find(item => item.id === period.value)?.nome || 'Escolha um período'), c('p', date.value ? 'Prazo: ' + new Date(date.value + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem prazo definido'));
    modeHint.textContent = team ? 'Um integrante envia para a equipe. A correção lança a mesma nota e devolutiva para todos os integrantes; não é necessário cada aluno enviar.' : 'Cada aluno envia seu próprio trabalho e recebe sua avaliação.';
    teamLink.hidden = !team; teamLink.href = m('equipes/', { sala: i, periodo: period.value });
    // Trocar a modalidade depois de uma entrega deixaria os registros incompatíveis.
    const hasDeliveries = n.entregas.some(item => item.missao_id === mission?.id);
    period.disabled = published || hasDeliveries; mode.disabled = hasDeliveries; weight.disabled = xp.disabled = hasDeliveries;
    fileList.replaceChildren();
    if (mission?.anexo_url) {
      const link = k({ url: mission.anexo_url, name: 'Abrir anexo atual' });
      if (link) fileList.append(u(c('li'), link));
    }
    if (selected) fileList.append(u(c('li'), c('span', selected.name + (mission?.anexo_url ? ' · substituirá o anexo atual' : ' · novo')), g('Retirar seleção', () => { selected = null; fileInput.value = ''; j = true; update(); }, 'text-button')));
    if (!selected && !mission?.anexo_url) fileList.append(c('li', 'Nenhum arquivo anexado.'));
    [save, preview, publish].forEach(button => button.disabled = saving || !n.periodos.length);
  }
  function payload() {
    if (!title.value.trim() || !period.value) throw new Error('Preencha o título e escolha um período.');
    const peso = Number(weight.value), pontos = Number(xp.value);
    if (!Number.isFinite(peso) || peso < .1 || peso > 10 || !Number.isInteger(pontos) || pontos < 0 || pontos > 1000) throw new Error('Confira o peso da nota e o XP.');
    return { titulo: title.value.trim(), descricao: description.value.trim(), o_que_entregar: deliverable.value.trim(), periodo_id: period.value, data_limite: date.value || null, tipo_atividade: mode.value, peso_nota: peso, xp_reward: pontos, status_publicacao: mission?.status_publicacao || 'rascunho', anexo: selected };
  }
  async function persist() {
    const body = payload();
    mission = mission ? await e.updateMission(i, mission.id, body) : await e.createMission(i, body);
    if (!mission?.id) throw new Error('O servidor não confirmou o salvamento. Confira a lista antes de tentar criar novamente.');
    // Guarda imediatamente o ID para que prévia/publicação nunca criem uma segunda atividade.
    t.set('atividade', mission.id); history.replaceState(null, '', m('atividade/editar/', { sala: i, atividade: mission.id }));
    selected = null; fileInput.value = ''; j = false;
    n.missoes = [...n.missoes.filter(item => item.id !== mission.id), mission]; update();
    status.textContent = mission.status_publicacao === 'publicado' ? 'Alterações salvas na atividade publicada.' : 'Rascunho salvo. O conteúdo ainda não está disponível aos alunos.';
  }
  async function perform(action) {
    if (saving) return;
    saving = true; error.textContent = ''; a('refresh').disabled = true; update();
    try {
      if (action === 'publish' && (!description.value.trim() || !deliverable.value.trim())) throw new Error('Preencha a orientação e “O que entregar?” antes de publicar.');
      status.textContent = 'Salvando no servidor…';
      await persist();
      if (action === 'preview') { j = false; location.assign(I(mission)); return; }
      if (action === 'publish') {
        const content = c('div');
        content.append(c('p', 'Ao publicar, os alunos poderão acessar conforme a ordem de desbloqueio.'), c('h3', mission.titulo), c('p', mission.descricao, 'document-copy'), c('h3', 'O que entregar?'), c('p', mission.o_que_entregar, 'document-copy'));
        const confirm = g('Publicar atividade', () => E(async () => {
          confirm.disabled = true;
          try {
            const result = await e.publishMission(i, mission.id);
            if (result.status_publicacao !== 'publicado') throw new Error('O servidor não confirmou a publicação.');
            mission = result; n.missoes = [...n.missoes.filter(item => item.id !== mission.id), mission]; j = false;
            a('actionDialog').close(); status.textContent = 'Atividade publicada para a turma.'; update();
          } catch (err) { confirm.disabled = false; throw err; }
        }), 'primary');
        content.append(confirm); C('Tudo pronto para compartilhar?', content);
      }
    } catch (err) {
      status.textContent = ''; error.textContent = err.message;
      if (!mission && !err.status && err.name === 'ErroAPI') error.textContent += ' O resultado pode não ter chegado: confira a lista de atividades antes de repetir a criação.';
    } finally { saving = false; a('refresh').disabled = false; update(); }
  }
  form.onsubmit = event => { event.preventDefault(); perform('save'); };
  preview.onclick = () => perform('preview'); publish.onclick = () => perform('publish');
  [title, description, deliverable, period, date, mode, weight, xp].forEach(input => input.oninput = () => { j = true; update(); });
  fileInput.onchange = async () => {
    try { selected = (await e.validateFiles(fileInput.files, 1))[0] || null; error.textContent = ''; j = true; }
    catch (err) { selected = null; fileInput.value = ''; error.textContent = err.message; }
    update();
  };
  if (!n.periodos.length) error.textContent = 'Crie um período na sala antes de preparar a atividade.';
  update();
}

function F() {
  w("Equipes da turma.", "Organize grupos por período, com os alunos cadastrados nesta sala.");
  a("pageActions").append(g("+ Criar equipe", () => {
    const o = c("form"), r = _(o, "Nome da equipe", "text", "team-name"), s = _(o, "Período", "select", "team-period");
    r.required = !0, r.maxLength = 80, s.required = !0, n.periodos.forEach(e => q(s, e.nome, e.id)), t.get("periodo") && (s.value = t.get("periodo"));
    const d = c("button", "Criar equipe", "primary"); d.type = "submit", d.disabled = !n.periodos.length;
    o.append(c("p", n.periodos.length ? "Depois da criação, escolha os integrantes." : "Crie um período na sala antes de formar a equipe.", "hint"), d);
    o.onsubmit = t => {
      t.preventDefault(), E(async () => {
        if (!r.value.trim() || !s.value) throw new Error("Informe o nome e o período.");
        d.disabled = !0;
        try {
          const t = await e.createTeam(i, { nome: r.value.trim(), periodo_id: s.value });
          a("actionDialog").close(), await G(), await H(t.id)
        } finally { d.disabled = !1 }
      })
    };
    C("Uma nova equipe", o)
  }, "primary"));
  const o = c("div", "", "team-grid");
  n.equipes.forEach(e => { const a = y(e.nome, n.periodos.find(a => a.id === e.periodo_id)?.nome || "Período da turma"); a.classList.add("team-card"), a.append(g("Ver integrantes e organizar →", () => H(e.id))), o.append(a) });
  a("content").append(o), n.equipes.length || a("content").append(c("p", "Nenhuma equipe criada neste período.", "empty"))
}
async function H(a) {
  try {
    const t = await e.team(i, a), o = c("div");
    o.append(c("p", `${t.membros.length} integrante${1 === t.membros.length ? "" : "s"}. Até 4 integrantes. O aluno pode pertencer a uma equipe por período.`));
    t.membros.forEach(t => {
      const n = c("div", "", "member");
      n.append(c("span", t.nome), g("Remover", () => {
        const o = c("div");
        o.append(c("p", `Remover ${t.nome} desta equipe? O aluno continuará cadastrado na turma.`), g("Confirmar remoção", () => E(async () => { await e.removeMember(i, a, t.id), await H(a) }), "primary"));
        C("Revisar remoção", o)
      }, "text-button")), o.append(n)
    });
    const n = c("form"), r = _(n, "Adicionar aluno da turma", "select", "team-student");
    t.alunos_disponiveis.forEach(e => q(r, e.nome, e.id));
    const s = c("button", "Adicionar integrante", "primary");
    s.type = "submit", s.disabled = !t.alunos_disponiveis.length || t.membros.length >= 4, n.append(s);
    n.onsubmit = t => { t.preventDefault(), E(async () => { if (!r.value) throw new Error("Selecione um aluno disponível."); await e.addMember(i, a, r.value), await H(a) }) };
    const shared=y("Planejamento da equipe", "Tarefas e avisos publicados pelos integrantes.");
    shared.append(c("h3","Tarefas"));
    for(const task of t.tarefas || []) shared.append(c("p",task.titulo+" · "+(task.responsavel?.nome || "Sem responsável")+" · "+({pendente:"A fazer",em_andamento:"Em andamento",concluida:"Concluída"}[task.status] || task.status)));
    if(!t.tarefas?.length) shared.append(c("p","Nenhuma tarefa cadastrada.","hint"));
    shared.append(c("h3","Mural"));
    for(const note of t.avisos || []) shared.append(c("p",(note.autor?.nome || "Integrante")+": "+note.texto,"document-copy"));
    if(!t.avisos?.length) shared.append(c("p","Nenhum aviso publicado.","hint"));
    o.append(shared);
    o.append(n), t.alunos_disponiveis.length || o.append(c("p", "Todos os alunos já estão em equipes deste período.", "hint")), C(t.equipe.nome, o)
  } catch (e) { h(e) }
}
function Z() {
  w("Correções da sala.", "Um retorno claro ajuda o aluno a avançar na próxima descoberta.");
  const e = y("Entregas dos alunos"), o = c("div", "", "filters"), r = c("input"), s = c("select");
  r.type = "search", r.placeholder = "Buscar aluno ou atividade…", r.setAttribute("aria-label", "Buscar entrega"), s.setAttribute("aria-label", "Situação da entrega"), q(s, "A corrigir", "entregue"), q(s, "Todas as entregas", ""), q(s, "Corrigidas", "corrigido");
  const d = c("div"); o.append(r, s), e.append(o, d), a("content").append(e);
  const l = () => {
    const e = r.value.toLowerCase(), a = t.get("atividade"), o = n.entregas.filter(t => (!s.value || t.status === s.value) && (!a || t.missao_id === a) && `${t.perfis?.nome || ""} ${t.titulo_missao || ""}`.toLowerCase().includes(e));
    d.replaceChildren(S(["Aluno", "Atividade", "Situação", "Nota", ""], o.map(e => [e.perfis?.nome || n.alunos.find(a => a.id === e.aluno_id)?.nome || "Aluno", e.titulo_missao || n.missoes.find(a => a.id === e.missao_id)?.titulo || "Atividade", "corrigido" === e.status ? "Corrigida" : "A corrigir", b(f(e.nota)), v("Abrir entrega", "correcao/", { sala: i, entrega: e.id }, "text-button")])));
    o.length || d.append(c("p", "Nenhuma entrega corresponde a estes filtros.", "empty"))
  };
  r.oninput = l, s.onchange = l, l()
}
let J = !1;
function X(e) { if (!e) return "Data não informada"; const a = new Date(e); return Number.isNaN(a.getTime()) ? "Data não informada" : a.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) }

async function G() {
  const s = ++l;
  A(), a("content").replaceChildren(), a("content").setAttribute("aria-busy", "true"), a("error").textContent = "", a("pageActions").replaceChildren(), a("refresh").disabled = !0, a("mode").textContent = "ÁREA DO PROFESSOR", a("modeNote").textContent = "Dados da sua conta. Atualize para consultar as alterações dos alunos.";
  (function () {
    const e = [["rooms", "Turmas", "", {}, "M3 5h18v16H3ZM7 9h3m4 0h3M7 14h3m4 0h3"]];
    i && e.push(
      ["room", "Sala", "sala/", { sala: i }, "M3 10 12 3l9 7v10H3Zm6 10v-7h6v7"],
      ["activities", "Atividades", "atividades/", { sala: i }, "M5 3h14v18H5ZM8 8h8M8 12h8M8 16h5"],
      ["teams", "Equipes", "equipes/", { sala: i }, "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a7 7 0 0 1 14 0v3m1-17a4 4 0 0 1 0 8m2 2a6 6 0 0 1 3 5v2"],
      ["corrections", "Correções", "correcoes/", { sala: i }, "M8 3H4v18h16V3h-4M8 2h8v4H8Zm0 11 3 3 5-6"]);
    i && e.push(["questions", "Perguntas", "perguntas/", { sala: i }, "M3 4h18v13H8l-5 4Zm4 4h10M7 12h6"]);
    e.push(["notifications", "Notificações", "notificacoes/", i ? {sala:i} : {}, "M18 8a6 6 0 0 0-12 0c0 8-3 7-3 10h18c0-3-3-2-3-10M10 21h4"]);

    /* Biblioteca aparece somente quando existe uma turma selecionada. */
    i && e.splice(3, 0, ["library", "Biblioteca", "biblioteca/", { sala: i }, "M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3Zm10 3a3 3 0 0 1 3-3h5v14h-5a3 3 0 0 0-3 3"]);

    a("mainNav").replaceChildren();
    for (const [t, i, n, r, s] of e) {
      const e = v("", n, r, ""); e.setAttribute("aria-label", i);
      const d = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      d.setAttribute("viewBox", "0 0 24 24"), d.setAttribute("aria-hidden", "true");
      const l = document.createElementNS(d.namespaceURI, "path"); l.setAttribute("d", s), d.append(l), e.append(d, c("span", i, "label"));
      (t === o || "room" === t && "student" === o || "activities" === t && ["activity", "create"].includes(o) || "corrections" === t && "review" === o) && (e.classList.add("active"), e.setAttribute("aria-current", "page"));
      a("mainNav").append(e)
    }
    a("brandHome").href = m("")
  })();
  try {
    if (r = await e.rooms(), s !== l) return;
    if ("rooms" === o) n = null, D(), await L(s);
    else if ("notifications" === o) {
      const {categoriaAviso, pertenceSala, pendenciaAviso} = await import('./professor-avisos-utils.js?v=2');
      if(!document.getElementById('teacherNoticesCSS')){const css=document.createElement('link');css.id='teacherNoticesCSS';css.rel='stylesheet';css.href=new URL('../public/css/professor-notificacoes-pagina.css?v=2',location.href).href;document.head.append(css);}
      document.body.classList.add('teacher-notices-page');
      n=i?await e.room(i):null;D();
      w(i?'Avisos da turma':'Sua caixa de avisos.',i?`Notificações de ${n.sala.nome}.`:'Avisos das suas turmas, organizados em um só lugar.');
      const {destinoNotificacao} = await import('../services/comunicacao.js');
      const response=await e.notifications(false);if(s!==l)return;
      const missionIds=new Set((n?.missoes||[]).map(m=>String(m.id)));
      const rows=(response.notificacoes||[]).filter(row=>!i||pertenceSala(row,i,missionIds));
      const filters=c('div','','filters notice-filters'),state=c('select'),type=c('select');
      state.id='noticeState';type.id='noticeType';state.setAttribute('aria-label','Situação da notificação');type.setAttribute('aria-label','Tipo de notificação');
      q(state,'Todas','all');q(state,'Não lidas','unread');q(state,'Lidas','read');
      q(type,'Todos os tipos','');for(const [key,label] of [['question','Perguntas'],['delivery','Entregas'],['material','Materiais'],['result','Resultados'],['task','Tarefas'],['info','Outros avisos']])q(type,label,key);
      const field=(text,input)=>{const box=c('div','','notice-filter-field');const label=c('label',text);label.htmlFor=input.id;box.append(label,input);return box;};
      const progress=c('select');progress.id='noticeProgress';progress.setAttribute('aria-label','Pendência da notificação');q(progress,'Todas','');q(progress,'Aguardando resposta','aguardando_resposta');q(progress,'Respondidas','respondida');q(progress,'Aguardando correção','aguardando_correcao');q(progress,'Corrigidas','corrigida');q(progress,'Situação não informada','desconhecida');
      const count=c('span','','notice-filter-count');count.setAttribute('role','status');filters.append(field('Leitura',state),field('Tipo de aviso',type),field('Pendência',progress),count);
      const grid=c('div','','notification-page');a('content').append(filters,grid);
      function renderNotices(){
        grid.replaceChildren();const shown=rows.filter(row=>{const read=!!row.lida_em||row.lida===true;return (state.value==='all'||(state.value==='read'?read:!read))&&(!type.value||categoriaAviso(row).key===type.value)&&(!progress.value||pendenciaAviso(row).key===progress.value);});
        count.textContent=`${shown.length} ${shown.length===1?'aviso':'avisos'}`;
        for(const row of shown){
          const category=categoriaAviso(row),read=!!row.lida_em||row.lida===true;
          const card=c('article','','notification-card');card.dataset.category=category.key;
          const meta=c('div','','notice-card-meta');meta.append(c('span',category.label,'notice-category'),c('span',read?'Lida':'Não lida','notice-read-state'));
          const workflow=pendenciaAviso(row);const badge=c('p',workflow.label,'notice-workflow');badge.dataset.pending=String(workflow.pending);
          const body=c('div','','notice-card-body');body.append(c('h2',row.titulo||'Aviso'),c('p',row.mensagem||''));
          const date=c('time',X(row.criado_em),'notice-date');const value=new Date(row.criado_em);if(!Number.isNaN(value.getTime()))date.dateTime=value.toISOString();
          const actions=c('div','','notice-card-actions');const destination=destinoNotificacao(row,'professor');
          if(destination){const open=c('a','Abrir →','secondary');open.href=destination;actions.append(open);}
          if(!read){const button=g('Marcar como lida',async()=>{button.disabled=true;try{await e.readNotifications([row.id]);row.lida=true;row.lida_em=true;renderNotices();window.dispatchEvent(new Event('astro-notifications-refresh'));}catch(error){h(error);button.disabled=false;}},'secondary');actions.append(button);}
          card.append(meta,badge,body,date,actions);grid.append(card);
        }
        if(!shown.length)grid.append(c('p',i?'Nenhum aviso desta turma corresponde aos filtros.':'Tudo em dia. Nenhum aviso corresponde aos filtros.','empty'));
      }
      state.onchange=type.onchange=progress.onchange=renderNotices;renderNotices();
    }

    else {
      if (!i) return w("Escolha uma turma.", "Abra a sala antes de consultar esta área."), n = null, D(), void await L(s);
      if (n = await e.room(i), "room" === o) {
        const e = c("a", "Materiais da biblioteca", "secondary");
        e.href = "biblioteca.html?sala=" + encodeURIComponent(i), a("pageActions").append(e)
      }
      if (s !== l) return;
      D();
      (function () {
        if (!["room", "student", "activities", "teams", "corrections"].includes(o) || !n.periodos.length) return;
        const e = t.get("periodo") || "", i = c("select");
        i.setAttribute("aria-label", "Filtrar por período"), q(i, "Todos os períodos", ""), n.periodos.forEach(e => q(i, e.nome, e.id)), i.value = e;
        i.onchange = () => { i.value ? t.set("periodo", i.value) : t.delete("periodo"), history.replaceState(null, "", location.pathname + "?" + t), G() };
        a("pageActions").append(i);
        const r = new Map((n.pauta.periodos || n.periodos).map((e, a) => [e.id, a]));
        if (n.missoes = [...n.missoes].sort((e, a) => (r.get(e.periodo_id) || 0) - (r.get(a.periodo_id) || 0) || (Number(e.ordem) || 0) - (Number(a.ordem) || 0)), !e) return;
        if (!n.periodos.some(a => a.id === e)) throw new Error("Período não encontrado nesta turma.");
        n.missoes = n.missoes.filter(a => a.periodo_id === e);
        const s = new Set(n.missoes.map(e => e.id));
        n.entregas = n.entregas.filter(e => s.has(e.missao_id)), n.equipes = n.equipes.filter(a => a.periodo_id === e);
        n.pauta = {
          ...n.pauta, pauta_data: n.pauta.pauta_data.map(e => {
            let a = 0, t = 0;
            return n.missoes.forEach(o => { const i = f(e.notas?.[o.id]); if (null !== i) { const e = Number(o.peso_nota) || 1; a += i * e, t += e } }), { ...e, media_missoes: t ? a / t : null, media: t ? a / t : null }
          })
        }
      })();
      await ({
        room: T,
        student: O,
        activities: B,
        activity: () => async function (o) {
          const r = n.missoes.find(e => e.id === t.get("atividade"));
          if (!r) throw new Error("Atividade não encontrada nesta sala.");
          w(r.titulo, "rascunho" === r.status_publicacao ? "Rascunho privado do professor." : "Orientação e materiais publicados para esta turma.");
          a("pageActions").append(v("Editar proposta", "atividade/editar/", { sala: i, atividade: r.id }, "primary"));
          const s = c("a", "Ver como aluno", "secondary"); s.href = I(r), a("pageActions").append(s);
          a("pageActions").append(v("Ver entregas", "correcoes/", { sala: i, atividade: r.id }, "primary"), v("Voltar às atividades", "atividades/", { sala: i }));
          const d = y("Orientação da atividade"); d.append(c("p", r.descricao || "Sem orientação cadastrada.", "document-copy"), c("h3", "O que entregar?"), c("p", r.o_que_entregar || "Não especificado pelo professor.", "document-copy"), c("p", r.tipo_atividade === "equipe" ? "Entrega compartilhada da equipe." : "Entrega individual.", "hint"));
          const p = y("PDFs e imagens da atividade", "Arquivos do professor para apoiar a investigação."), m = c("ul", "", "files-list");
          p.append(m), a("content").append(u(c("div", "", "two-columns"), d, p));
          try {
            const a = await e.files(i, r.id); if (o !== l) return;
            a.forEach(e => { const a = k(e); a && m.append(u(c("li"), a, c("span", e.size ? `${Math.ceil(e.size / 1024)} KB` : "Arquivo salvo", "small-label"))) }), a.length || m.append(c("li", "Nenhum arquivo anexado."))
          } catch (e) { p.append(c("p", e.message, "hint")) }
          const g = c("form"), f = _(g, r.anexo_url ? "Substituir anexo" : "Adicionar anexo", "file", "extra-files");
          const uploadRules = await e.uploadRules();
          f.multiple = false; f.accept = uploadRules.accept;
          const b = c("button", r.anexo_url ? "Substituir anexo" : "Salvar anexo", "secondary"); b.type = "submit";
          g.append(c("p", "Um anexo por atividade. " + uploadRules.aviso + " Um novo arquivo substitui o atual.", "hint"), b);
          g.onsubmit = async t => {
            t.preventDefault(), b.disabled = !0;
            try { const t = await e.validateFiles(f.files, 1); if (!t.length) throw new Error("Escolha pelo menos um arquivo."); await e.attach(i, r.id, t), a("status").textContent = "Anexo salvo no servidor.", await G() } catch (t) { h(t) } finally { b.disabled = !1 }
          };
          p.append(g)
        }(s),
        create: () => V(),
        teams: F,
        corrections: Z,
        review: () => async function (o) {
          const r = n.entregas.find(e => e.id === t.get("entrega"));
          if (!r) throw new Error("Entrega não encontrada nesta turma.");
          const s = await e.delivery(r.id); if (o !== l) return;
          const d = n.missoes.find(e => e.id === r.missao_id), u = s.perfis || n.alunos.find(e => e.id === r.aluno_id);
          w("Um retorno que faz avançar.", `${u?.nome || "Aluno"} · ${d?.titulo || r.titulo_missao || "Atividade"}`);
          a("pageActions").append(v("← Todas as entregas", "correcoes/", { sala: i }, "secondary"), v("Histórico do aluno", "aluno/", { sala: i, aluno: r.aluno_id || u?.id }, "text-button"));
          const m = c("div", "", "review-grid"), h = c("div", "", "stack"), b = y("Trabalho do aluno"), x = c("div", "", "review-meta");
          x.append(c("span", "corrigido" === s.status ? "Correção registrada" : "Aguardando correção", "corrigido" === s.status ? "badge green" : "badge gold"), c("span", "Entregue em " + X(s.entregue_em), "small-label"));
          b.append(x, c("p", s.resposta_entrega || "Nenhum texto foi enviado. Consulte os anexos abaixo.", "document-copy"));
          const A = c("details", "", "orientation");
          A.append(c("summary", "Relembrar a orientação da atividade"), c("p", d?.descricao || "Sem orientação cadastrada.", "document-copy")), b.append(A), h.append(b);
          const C = y("Anexos da entrega", "PDFs e imagens podem ser visualizados aqui. Outros documentos ficam disponíveis para baixar."), E = c("div", "", "review-file-list"), q = c("div", "", "file-preview");
          C.append(E, q), h.append(C);
          const S = s.anexos || [];
          let N = null;
          for (const e of S) {
            const a = k(e); if (!a) continue;
            a.className = "text-button", a.textContent = "Baixar";
            const t = c("div", "", "review-file"), o = c("div");
            if (o.append(c("strong", e.name), c("small", e.size ? Math.ceil(e.size / 1024) + " KB" : "Arquivo enviado")), t.append(o, a), ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(e.type)) {
              let a = null;
              if (e.blob instanceof Blob) a = URL.createObjectURL(e.blob), p.push(a);
              else try { const t = new URL(e.preview_url || e.url); "https:" === t.protocol && (a = t.href) } catch { }
              if (a) {
                const o = () => {
                  if (q.replaceChildren(), E.querySelectorAll("button").forEach(e => e.setAttribute("aria-pressed", "false")), i.setAttribute("aria-pressed", "true"), q.append(c("p", e.name, "small-label")), "application/pdf" === e.type) {
                    const t = c("iframe"); t.title = "Visualização de " + e.name, t.src = a, t.setAttribute("sandbox", ""), q.append(t, c("p", "Se o PDF não abrir, use Baixar. Para renovar o acesso aos anexos, atualize a página.", "hint"))
                  } else {
                    const t = c("img"); t.alt = "Anexo do aluno: " + e.name, t.src = a, q.append(t)
                  }
                }, i = g("Visualizar", o, "secondary");
                i.setAttribute("aria-pressed", "false"), t.append(i), N ??= o
              }
            }
            E.append(t)
          }
          S.length || C.append(c("p", "Nenhum arquivo anexado.", "empty")), N && N();
          const M = y("Sua devolutiva", "Avalie o processo e indique um próximo passo."); M.classList.add("review-evaluation");
          const R = c("form"); R.id = "reviewForm";
          const P = _(R, "Nota · de 0 a 10", "number", "delivery-grade", s.nota ?? ""), $ = _(R, "Orientação ao aluno", "textarea", "delivery-feedback", s.comentario_professor || "");
          P.required = !0, P.min = "0", P.max = "10", P.step = ".1", $.maxLength = 3e3, $.rows = 8, $.placeholder = "O que foi bem feito? O que pode melhorar? Qual é o próximo passo?";
          const L = c("p", `${$.value.length} / 3.000 caracteres`, "hint"), z = c("p", "", "hint"); R.append(L, z);
          const D = `astrolearn-review-demo-${r.id}`;
          if ("corrigido" !== s.status) try {
            const e = JSON.parse(sessionStorage.getItem(D));
            e && (P.value = e.nota ?? "", $.value = e.feedback || "", L.textContent = $.value.length + " / 3.000 caracteres", z.textContent = "Rascunho recuperado nesta aba.", J = !0)
          } catch { }
          const T = c("button", "Salvar correção", "primary"), O = c("p", "", "error-panel");
          T.type = "submit", O.setAttribute("role", "alert");
          R.append(c("p", s.equipe_id ? "A mesma nota e devolutiva serão lançadas para os integrantes desta entrega em equipe." : "A nota e a devolutiva serão enviadas ao aluno.", "hint"), T, O);
          P.oninput = $.oninput = () => {
            J = !0, L.textContent = $.value.length + " / 3.000 caracteres";
            try { sessionStorage.setItem(D, JSON.stringify({ nota: P.value, feedback: $.value })), z.textContent = "Rascunho salvo nesta aba." } catch { z.textContent = "Alterações mantidas somente nesta visita." }
          };
          const B = c("details", "", "orientation");
          B.append(c("summary", "Como escrever uma boa devolutiva"), c("p", "Reconheça uma escolha acertada, explique uma melhoria concreta e proponha um próximo passo. Exemplo: “Você manteve a água igual nas duas plantas. Agora registre a altura diariamente para comparar os resultados.”", "hint"));
          M.append(R, B);
          const U = () => {
            P.disabled = $.disabled = T.disabled = !0, T.textContent = "Correção registrada", J = !1, z.textContent = "Nota e devolutiva registradas.";
            try { sessionStorage.removeItem(D) } catch { }
            const e = n.entregas.find(e => "entregue" === e.status && e.id !== r.id), a = c("div", "", "button-row");
            e && a.append(v("Próxima entrega →", "correcao/", { sala: i, entrega: e.id }, "primary")), a.append(v("Voltar à fila", "correcoes/", { sala: i })), M.append(a)
          };
          "corrigido" === s.status && U();
          R.onsubmit = async t => {
            if (t.preventDefault(), T.disabled) return;
            const o = f(P.value);
            if (null === o || o < 0 || o > 10) return O.textContent = "Informe uma nota entre 0 e 10.", void P.focus();
            T.disabled = !0, a("refresh").disabled = !0, O.textContent = "";
            try {
              await e.correct(r.id, o, $.value.trim()), U(), a("status").textContent = "Correção salva no servidor.", window.dispatchEvent(new window.Event("astro-notifications-refresh"))
            } catch (t) {
              let i = !1;
              try { const a = await e.delivery(r.id); i = "corrigido" === a.status && f(a.nota) === o && (a.comentario_professor || "") === $.value.trim() } catch { }
              i ? (U(), a("status").textContent = "Consulta concluída: esta correção já está registrada.") : (O.textContent = t.message, T.disabled = !1)
            } finally { a("refresh").disabled = !1 }
          };
          m.append(h, M), a("content").append(m)
        }(s),
        questions: () => async function (o) {
          const r = await e.questions(i); if (o !== l) return;
          w("Perguntar também é aprender.", "Conversas privadas dos alunos com o professor, organizadas por atividade.");
          const s = r.filter(e => !e.resposta).length;
          a("content").append(u(c("section", "", "stats"), x("Aguardando resposta", s), x("Respondidas", r.length - s), x("Perguntas nesta turma", r.length)));
          a("pageActions").append(v("← Voltar à sala", "sala/", { sala: i }));
          const p = c("div", "", "filters"), m = c("input"), g = c("select");
          m.type = "search", m.placeholder = "Buscar aluno, atividade ou pergunta…", m.setAttribute("aria-label", "Buscar pergunta"), g.setAttribute("aria-label", "Situação da pergunta"), q(g, "Sem resposta", "pending"), q(g, "Todas", "all"), q(g, "Respondidas", "answered"), t.get("pergunta") && (g.value = "all"), p.append(m, g), a("content").append(p);
          const h = c("div", "", "question-list"), f = c("p", "Nenhuma pergunta corresponde aos filtros.", "empty"); a("content").append(h, f);
          const b = [];
          for (const o of r) {
            const i = y(o.perfis?.nome || n.alunos.find(e => e.id === o.aluno_id)?.nome || "Aluno", (o.missoes?.titulo || n.missoes.find(e => e.id === o.missao_id)?.titulo || "Atividade") + " · " + X(o.criado_em));
            i.id = "pergunta-" + o.id, i.classList.add("question-card"), t.get("pergunta") === o.id && i.classList.add("question-highlight"), i.append(c("p", o.texto, "document-copy"));
            const s = c("div", "", "teacher-reply"); i.append(s);
            const d = () => { s.replaceChildren(c("strong", "Sua resposta"), c("p", o.resposta, "document-copy"), c("small", X(o.respondida_em))) };
            if (o.resposta) d();
            else {
              s.hidden = !0;
              const t = c("form"), n = _(t, "Responder ao aluno", "textarea", "reply-" + o.id);
              n.required = !0, n.maxLength = 3e3, n.rows = 3;
              const l = c("button", "Enviar resposta", "primary"), p = c("p", "", "error-panel");
              l.type = "submit", p.setAttribute("role", "alert"), t.append(c("p", "A resposta fica visível somente para este aluno e o professor.", "hint"), l, p), i.append(t);
              t.onsubmit = async i => {
                if (i.preventDefault(), !l.disabled)
                  if (n.value.trim()) {
                    l.disabled = !0, p.textContent = "";
                    try {
                      const i = await e.answer(o.id, n.value.trim());
                      if (!i.pergunta?.id) throw new Error("A resposta não foi confirmada.");
                      Object.assign(o, i.pergunta), t.hidden = !0, s.hidden = !1, d(), a("status").textContent = "Resposta salva no servidor.", A();
                      const l = a("content").querySelectorAll(".stats strong");
                      l[0].textContent = r.filter(e => !e.resposta).length, l[1].textContent = r.filter(e => e.resposta).length
                    } catch (i) { p.textContent = i.message, l.disabled = !1 }
                  } else p.textContent = "Escreva uma orientação para o aluno."
              }
            }
            h.append(i), b.push({ p: i, q: o })
          }
          function A() {
            let e = 0;
            const a = m.value.trim().toLowerCase();
            b.forEach(({ p: t, q: o }) => {
              const i = "all" === g.value || "pending" === g.value && !o.resposta || "answered" === g.value && o.resposta;
              t.hidden = !i || !`${o.perfis?.nome || ""} ${o.missoes?.titulo || ""} ${o.texto}`.toLowerCase().includes(a), t.hidden || e++
            });
            f.hidden = e > 0
          }
          m.oninput = g.onchange = A, A();
          t.get("pergunta") && document.getElementById("pergunta-" + t.get("pergunta"))?.scrollIntoView?.({ block: "center", behavior: "instant" })
        }(s)
      }[o]?.())
    }
  } catch (e) {
    s === l && (h(e), a("content").replaceChildren(u(c("section", "", "panel"), c("p", "Não foi possível carregar esta página. Seus dados não foram substituídos por exemplos."), v("Voltar às turmas", "", {}, "primary"))))
  } finally {
    s === l && (a("refresh").disabled = !1, a("content").setAttribute("aria-busy", "false"))
  }
}

window.addEventListener("beforeunload", e => { (J || j) && (e.preventDefault(), e.returnValue = "") });
a("refresh").onclick = () => { (!J && !j || window.confirm("Atualizar a página? Salve os rascunhos e arquivos antes de atualizar.")) && G() };
window.addEventListener("pagehide", A);
G();
})();