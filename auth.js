document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // -------------------------------------------------------------------------------------------------------- //
    // FORMULARIO LOGIN/CADASTRO ALTERNAR 
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    // -------------------------------------------------------------------------------------------------------- //
    // LÓGICA DE CADASTRO 
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerMessage.textContent = ''; //limpar mensagen santeriores

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        // VALIDACAO SIMPLES
        if (!name || !email || !password) {
            showMessage(registerMessage, 'Por favor, preencha todos os campos.', 'error');
            return;
        }

        // Usuários cadastrados do LocalStorage/cria array
        const users = JSON.parse(localStorage.getItem('doceCoffeeUsers')) || [];

        // Verificar se o usuário já existe
        const userExists = users.find(user => user.email === email);

        if (userExists) {
            showMessage(registerMessage, 'Este e-mail já está cadastrado.', 'error');
            return;
        }

        // Adiciona novo usuário
        const newUser = { name, email, password }; 
        users.push(newUser);
        
        localStorage.setItem('doceCoffeeUsers', JSON.stringify(users)); // Salva no LocalStorage
        localStorage.setItem('doceCoffeeCurrentUser', JSON.stringify(newUser)); // Loga o usuário automaticamente

        
        showMessage(registerMessage, 'Conta criada com sucesso! Redirecionando...', 'success'); // Redirecionamento
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000); // Espera 2s antes de redirecionar
    });

    
    // -------------------------------------------------------------------------------------------------------- //
    // LÓGICA DE LOGIN 
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginMessage.textContent = ''; // Limpa mensagens

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('doceCoffeeUsers')) || []; // Pega usuários
        const user = users.find(user => user.email === email && user.password === password); // Procura pelo usuário

        if (user) {
            localStorage.setItem('doceCoffeeCurrentUser', JSON.stringify(user));
            showMessage(loginMessage, 'Login bem-sucedido! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(loginMessage, 'E-mail ou senha incorretos.', 'error');
        }
    });


    // Função auxiliar para mostrar mensagens
    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = `form-message ${type}`; // 'success' ou 'error'
    }
});