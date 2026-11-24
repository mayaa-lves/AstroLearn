// Reservado: Login, cadastro, sessão e saída. Confirmar perfil retornado pelo servidor.
// TODO: criar funções usando solicitar de ./api.js durante a etapa desta área.
import { CONFIG } from '../config.js';
import { solicitar, ErroAPI } from './api.js';

function perfilValido(usuario) {
    return usuario &&
        typeof usuario.id === 'string' &&
        usuario.id.length > 0 &&
        ['aluno', 'professor'].includes(usuario.role);
}

// A leitura do JWT apenas orienta a interface.
// A autorização de acesso continua sendo feita pelo backend.
function tokenExpirado(token) {
    try {
        const parte = token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const { exp } = JSON.parse(atob(parte));

        return typeof exp === 'number' &&
            Date.now() >= exp * 1000;
    } catch {
        return false;
    }
}

export function limparSessao() {
    sessionStorage.removeItem(CONFIG.chaveSessao);
}

export function obterSessao() {
    try {
        const sessao = JSON.parse(
            sessionStorage.getItem(CONFIG.chaveSessao)
        );

        if (typeof sessao?.token !== 'string' ||
            !sessao.token ||
            !perfilValido(sessao.usuario) ||
            tokenExpirado(sessao.token)) {
            limparSessao();
            return null;
        }

        return sessao;
    } catch {
        return null;
    }
}

export function obterToken() {
    return obterSessao()?.token ?? null;
}

export async function entrar({ email, senha }, { sinal } = {}) {
    email = String(email ?? '').trim().toLowerCase();

    if (!email || typeof senha !== 'string' || !senha) {
        throw new ErroAPI('Preencha o e-mail e a senha.');
    }

    const dados = await solicitar('/api/auth/login', {
        metodo: 'POST',
        dados: { email, senha },
        sinal,
    });

    if (typeof dados?.access_token !== 'string' ||
        !dados.access_token ||
        !perfilValido(dados.user) ||
        tokenExpirado(dados.access_token)) {
        throw new ErroAPI(
            'Não foi possível confirmar seu perfil. Procure o responsável pela plataforma.'
        );
    }

    const {
        id,
        nome,
        email: emailPerfil,
        role,
        avatar_url,
        xp,
    } = dados.user;

    const sessao = {
        token: dados.access_token,
        usuario: {
            id,
            nome,
            email: emailPerfil,
            role,
            avatar_url,
            xp,
        },
    };

    try {
        sessionStorage.setItem(
            CONFIG.chaveSessao,
            JSON.stringify(sessao)
        );
    } catch {
        throw new ErroAPI(
            'Permita o armazenamento do navegador para manter o login.'
        );
    }

    // Senha e refresh_token não são armazenados.
    return sessao.usuario;
}

export function destinoAposLogin() {
    const sessao = obterSessao();

    if (!sessao) {
        throw new ErroAPI('Faça login para continuar.', 401);
    }

    if (sessao.usuario.role === 'aluno') {
        try {
            const convite = sessionStorage.getItem('astrolearn-convite-v1');
            if (convite && /^[A-Za-z0-9-]{1,100}$/.test(convite)) {
                const target = new URL('../../../aluno/convite.html', import.meta.url);
                target.searchParams.set('codigo', convite); return target.href;
            }
        } catch {}
    }
    return new URL(
        `../../../${sessao.usuario.role}/home.html`,
        import.meta.url
    ).href;
}

export async function sair() {
    const token = obterToken();

    try {
        if (token) {
            await solicitar('/api/auth/logout', {
                metodo: 'POST',
                token,
            });
        }
    } finally {
        limparSessao();
    }
}

export async function cadastrar(
    { nome, email, senha, role = 'aluno', chave_mestra },
    { sinal } = {}
) {
    nome = String(nome ?? '').trim();
    email = String(email ?? '').trim().toLowerCase();

    if (!nome || !email || typeof senha !== 'string' || senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha) || !/[^A-Za-z0-9]/.test(senha)) {
        throw new ErroAPI(
            'Confira o nome e o e-mail. Use uma senha com pelo menos 8 caracteres, maiúscula, minúscula, número e símbolo.'
        );
    }

    if (!['aluno', 'professor'].includes(role)) {
        throw new ErroAPI('Escolha um perfil válido.');
    }

    const dados = { nome, email, senha, role };

    if (role === 'professor') {
        if (typeof chave_mestra !== 'string' || !chave_mestra.trim()) {
            throw new ErroAPI('Informe a chave de autorização do professor.');
        }

        dados.chave_mestra = chave_mestra.trim();
    }

    return solicitar('/api/auth/cadastro', {
        metodo: 'POST',
        dados,
        sinal,
    });
}