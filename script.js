document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------------------------------------- //
    // FUNCAO USUARIO LOGADO/ATUALIZACAO CABECALHO      
    function checkLoginState() {
        const user = JSON.parse(localStorage.getItem('doceCoffeeCurrentUser'));
        const authContainer = document.getElementById('user-auth-container');
        const heroLoginButton = document.querySelector('.hero-buttons .login-link');

        if (user && authContainer) {
            const firstName = user.name.split(' ')[0];

            authContainer.innerHTML = `
                <a href="#"><i class="fas fa-search"></i></a>
                <a href="#"><i class="fas fa-shopping-bag"></i></a>
                <span class="welcome-msg">Olá, ${escapeHTML(firstName)}!</span>
                <a href="#" class="btn-logout">Sair</a>
            `;

            // Esconde o botão de login
            if(heroLoginButton) {
                heroLoginButton.style.display = 'none';
            }

            // Event Listener para o botão Sair
            const logoutButton = authContainer.querySelector('.btn-logout');
            if (logoutButton) {
                logoutButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('doceCoffeeCurrentUser');
                    // Recarrega a página 
                    window.location.reload(); 
                });
            }

        } else {
            // Redirecionar para o login
            const loginLinks = document.querySelectorAll('.login-link');
            
            loginLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    window.location.href = 'login.html'; // Redireciona via JS
                });
            });
        }
    }

    // Verificação de login
    checkLoginState();

    // -------------------------------------------------------------------------------------------------------- //
    // VALIDAÇÃO DO FORMULÁRIO   
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const emailValue = emailInput.value.trim();
            
            // Remove mensagens antigas se existirem
            const existingMsg = newsletterForm.nextElementSibling;
            if(existingMsg && (existingMsg.classList.contains('msg-error') || existingMsg.classList.contains('msg-success'))) {
                existingMsg.remove();
            }

            const msgElement = document.createElement('p');

            // Validacao do formato de e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailValue)) {
                msgElement.textContent = "Por favor, insira um e-mail válido.";
                msgElement.className = "msg-error";
                newsletterForm.after(msgElement);
            } else {
                msgElement.textContent = "Sucesso! Seu cupom foi enviado para seu e-mail.";
                msgElement.className = "msg-success";
                newsletterForm.after(msgElement);
                newsletterForm.reset();
            }
        });
    }


    // -------------------------------------------------------------------------------------------------------- //
    // SISTEMA DE COMENTÁRIOS (DOM + LocalStorage)
    const commentForm = document.getElementById('comment-form');
    const commentsContainer = document.getElementById('comments-container');
    const inputId = document.getElementById('comment-id');
    const inputName = document.getElementById('comment-name');
    const inputText = document.getElementById('comment-text');
    const btnSubmit = document.getElementById('submit-comment-btn');
    const btnCancel = document.getElementById('cancel-edit-btn');

    // Auto preenche o nome de usuario
    const currentUser = JSON.parse(localStorage.getItem('doceCoffeeCurrentUser'));
    if (currentUser && inputName) {
        inputName.value = currentUser.name;
        //inputName.disabled = true; //travar o nome
    }

    // Carregar comentários salvos
    if (commentsContainer) {
        loadComments();
    }

    // Enviar/Salvar
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = inputName.value.trim();
            const text = inputText.value.trim();
            const id = inputId.value;

            if (!name || !text) {
                 console.error("Preencha todos os campos!"); // Evita alert()
                 return;
            }

            if (id) {
                updateComment(id, name, text);
            } else {
                createComment(name, text);
            }

            commentForm.reset();
            if (currentUser) inputName.value = currentUser.name; // preenche o nome
            
            resetFormState();
        });
    }

    // Cancelar Edição
    if(btnCancel) {
        btnCancel.addEventListener('click', () => {
            commentForm.reset();
            if (currentUser) inputName.value = currentUser.name;  // preenche o nome
            
            resetFormState();
        });
    }

    // -------------------------------------------------------------------------------------------------------- //
    // FUNÇÕES
    function getComments() {
        const comments = localStorage.getItem('doceCoffeeComments');
        return comments ? JSON.parse(comments) : [];
    }

    function saveCommentsToStorage(comments) {
        localStorage.setItem('doceCoffeeComments', JSON.stringify(comments));
    }

    function createComment(name, text) {
        const comments = getComments();
        
        const newComment = {
            id: Date.now().toString(), // ID único baseado no tempo
            name: name,
            text: text,
            date: new Date().toLocaleDateString('pt-BR')
        };

        comments.push(newComment);
        saveCommentsToStorage(comments);
        renderComments();
    }

    function updateComment(id, name, text) {
        let comments = getComments();
        const index = comments.findIndex(c => c.id === id);

        if (index !== -1) {
            comments[index].name = name;
            comments[index].text = text;
            saveCommentsToStorage(comments); // atualiza a data
            renderComments();
        }
    }

    function deleteComment(id) {
        console.log("Deletando comentário... (substituir confirm())");
        
        let comments = getComments();
        comments = comments.filter(c => c.id !== id);
        saveCommentsToStorage(comments);
        renderComments();
    }

    function editCommentSetup(id) {
        const comments = getComments();
        const comment = comments.find(c => c.id === id);

        if (comment) {
            // Permite editar se o usuario tiver comentado
            if (currentUser && currentUser.name === comment.name) {
                inputId.value = comment.id;
                inputName.value = comment.name;
                inputText.value = comment.text;
                
                btnSubmit.textContent = "Atualizar Comentário";
                btnCancel.style.display = "inline-block";
                
                commentForm.scrollIntoView({ behavior: 'smooth' });
            } else if (!currentUser) {
                console.warn("Você precisa estar logado para editar.");
            } else {
                console.warn("Você só pode editar seus próprios comentários.");
            }
        }
    }

    function resetFormState() {
        inputId.value = '';
        btnSubmit.textContent = "Publicar Comentário";
        if(btnCancel) btnCancel.style.display = "none";
    }

    function loadComments() {
        renderComments();
    }

    function renderComments() {
        commentsContainer.innerHTML = '';
        const comments = getComments();

        // Mostra os comentarios mais recentes primeiro
        comments.slice().reverse().forEach(comment => {
            const card = document.createElement('div');
            card.classList.add('comment-card');

            card.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${escapeHTML(comment.name)}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-body">
                    ${escapeHTML(comment.text)}
                </div>
                <div class="comment-actions" id="actions-${comment.id}">
                    <!-- Os botões serão adicionados dinamicamente se o usuário puder interagir -->
                </div>
            `;

            // Adiciona ações apenas se o usuário logado tiver comentado
            const actionsContainer = card.querySelector(`#actions-${comment.id}`);
            if (currentUser && currentUser.name === comment.name) {
                const btnEdit = document.createElement('button');
                btnEdit.className = 'btn-action btn-edit';
                btnEdit.dataset.id = comment.id;
                btnEdit.textContent = 'Editar';
                btnEdit.addEventListener('click', () => editCommentSetup(comment.id));
                
                const btnDelete = document.createElement('button');
                btnDelete.className = 'btn-action btn-delete';
                btnDelete.dataset.id = comment.id;
                btnDelete.textContent = 'Excluir';
                btnDelete.addEventListener('click', () => deleteComment(comment.id));

                actionsContainer.appendChild(btnEdit);
                actionsContainer.appendChild(btnDelete);
            }

            commentsContainer.appendChild(card);
        });
    }

    // Função auxiliar-injeção de código (XSS)
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    }
});