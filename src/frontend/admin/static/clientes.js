
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const tableBody = document.querySelector('#clientesTable tbody');
    const searchNomeInput = document.getElementById('searchNome');
    
    const btnSearchNome = document.getElementById('btnSearchNome');
    const btnExport = document.getElementById('btnExport');
    const btnEdit = document.getElementById('btnEdit');
    const btnDelete = document.getElementById('btnDelete');
    
    const modal = document.getElementById('editModal');
    const spanClose = document.getElementsByClassName('close')[0];
    const editForm = document.getElementById('editForm');
    const btnCancelar = document.getElementById('btnCancelar');

    let todosClientes = [];
    let filtroAtivo = false;
    let selectedRow = null;
    let selectedClientId = null;

    carregarClientes();

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('adminToken')
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.nome || !data.telefone) {
            alert('Nome e Telefone são obrigatórios.');
            return;
        }

        try {
            const response = await fetch('/api/admin/clientes', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Cliente cadastrado com sucesso!');
                form.reset();
                carregarClientes();
            } else {
                alert(result.error || 'Erro ao cadastrar cliente.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });

    btnSearchNome.addEventListener('click', () => {
        const nome = searchNomeInput.value.trim().toLowerCase();
        if (nome) {
            document.getElementById('btnClearNome').style.display = 'block';
            const filtrados = todosClientes.filter(c => c.nome.toLowerCase().includes(nome));
            renderizarTabela(filtrados);
        } else {
            carregarClientes();
        }
    });

    btnEdit.addEventListener('click', () => {
        if (selectedClientId) {
            const cliente = todosClientes.find(c => c.id == selectedClientId);
            if (cliente) {
                abrirModalEdicao(cliente);
            }
        }
    });

    btnDelete.addEventListener('click', async () => {
        if (selectedClientId) {
            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                try {
                    const response = await fetch(`/api/admin/clientes/${selectedClientId}`, { 
                        method: 'DELETE',
                        headers: getHeaders()
                    });
                    if (response.ok) {
                        alert('Cliente excluído com sucesso!');
                        deselecionarLinha();
                        carregarClientes();
                    } else {
                        alert('Erro ao excluir cliente.');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao conectar com o servidor.');
                }
            }
        }
    });

    async function carregarClientes() {
        try {
            const response = await fetch('/api/admin/clientes', { headers: getHeaders() });
            if (response.status === 403 || response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            const clientes = await response.json();
            todosClientes = clientes;
            filtroAtivo = false;
            
            deselecionarLinha();
            renderizarTabela(clientes);
            
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    function renderizarTabela(clientes) {
        tableBody.innerHTML = '';

        if (clientes.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum cliente encontrado.</td>';
            tableBody.appendChild(tr);
            return;
        }

        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.dataset.id = cliente.id;
            
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.sobrenome || '-'}</td>
                <td>${cliente.telefone || '-'}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.cep || '-'}</td>
                <td>${cliente.endereco || '-'}</td>
            `;

            tr.addEventListener('click', () => selecionarLinha(tr, cliente.id));
            tableBody.appendChild(tr);
        });
    }

    function abrirModalEdicao(cliente) {
        document.getElementById('editId').value = cliente.id;
        document.getElementById('editNome').value = cliente.nome;
        
        document.getElementById('editTelefone').value = cliente.telefone;
        document.getElementById('editEmail').value = cliente.email || '';
        document.getElementById('editEndereco').value = cliente.endereco || '';
        
        modal.style.display = "block";
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/admin/clientes/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Cliente atualizado com sucesso!');
                modal.style.display = "none";
                carregarClientes();
            } else {
                alert(result.error || 'Erro ao atualizar cliente.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });

});

