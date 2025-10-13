// ===================== DADOS DE USUÁRIOS =====================
const usuarios = [
    {
        id: 1,
        nome: "Administrador",
        usuario: "admin",
        senha: "admin123",
        nivel: "admin",
        lojasPermitidas: ["todas"]
    },
    {
        id: 3,
        nome: "Vendedor",
        usuario: "vendedor",
        senha: "vendedor123",
        nivel: "vendedor",
        lojasPermitidas: ["primitiva1"]
    }
];

// ===================== LOGIN =====================
function processarLogin(event) {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    if (!usuario || !senha) {
        errorMsg.textContent = 'Preencha todos os campos';
        errorMsg.style.display = 'block';
        return;
    }

    const usuarioValido = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if (usuarioValido) {
        localStorage.setItem('usuarioLogado', JSON.stringify({
            id: usuarioValido.id,
            nome: usuarioValido.nome,
            usuario: usuarioValido.usuario,
            nivel: usuarioValido.nivel,
            lojasPermitidas: usuarioValido.lojasPermitidas
        }));

        window.location.href = 'estoque.html';
    } else {
        errorMsg.textContent = 'Usuário ou senha incorretos';
        errorMsg.style.display = 'block';
    }
}

// ===================== VERIFICAÇÃO DE LOGIN =====================
function verificarLogin() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return false;
    }

    const nomeUser = document.querySelector('.username');
    if (nomeUser) nomeUser.textContent = usuarioLogado.nome;

    // Oculta opções de admin para vendedores
    if (usuarioLogado.nivel !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Configura botão de logout sempre que o usuário está logado
    configurarLogout();

    return usuarioLogado;
}

// ===================== LOGOUT =====================
function configurarLogout() {
    const btnLogout = document.querySelector('.logout');

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('usuarioLogado');
                window.location.href = 'login.html';
            }
        });
    }
}
