function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.backgroundColor = type === 'error' ? '#d32f2f' : '#2e7d32';
    setTimeout(() => t.style.opacity = '0', 3000);
}

function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const btnLogin = document.getElementById('tab-login');
    const btnReg = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        btnLogin.classList.add('active');
        btnReg.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        btnLogin.classList.remove('active');
        btnReg.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('login-user').value.trim();
        const senha = document.getElementById('login-pass').value;
        
        try {
            const res = await fetch('/api/clientes/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, senha })
            });
            
            if (!res.ok) throw new Error(await res.text());
            
            const user = await res.json();
            localStorage.setItem('user_data', JSON.stringify(user));
            showToast(`Bem-vindo de volta, ${user.nome}!`);
            setTimeout(() => window.location.href = '/', 1500);
        } catch (err) {
            showToast('Credenciais inválidas', 'error');
        }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('reg-name').value.trim();
        const telefone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const endereco = document.getElementById('reg-address').value.trim();
        const senha = document.getElementById('reg-pass').value;

        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, telefone, email, endereco, senha })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao cadastrar');
            }

            const user = await res.json();
            localStorage.setItem('user_data', JSON.stringify(user));
            showToast('Cadastro realizado com sucesso!');
            setTimeout(() => window.location.href = '/', 1500);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
});

