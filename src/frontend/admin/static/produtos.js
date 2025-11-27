
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('produtoForm');
    const tableBody = document.querySelector('#produtosTable tbody');
    const btnEdit = document.getElementById('btnEdit');
    const btnDelete = document.getElementById('btnDelete');
    
    const modal = document.getElementById('editModal');
    const spanClose = document.getElementsByClassName('close')[0];
    const editForm = document.getElementById('editForm');
    const btnCancelar = document.getElementById('btnCancelar');

    let todosProdutos = [];
    let selectedRow = null;
    let selectedProdId = null;

    carregarProdutos();

    function getHeaders() {
        return {
            'Authorization': localStorage.getItem('adminToken')
        };
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const tipo = document.getElementById('tipo').value;
        const valor = document.getElementById('valor').value;
        const fileInput = document.getElementById('imagem');
        
        let imagemPath = '';

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': localStorage.getItem('adminToken') }, 
                    body: formData
                });
                const data = await res.json();
                if (data.path) imagemPath = data.path;
            } catch (err) {
                console.error('Erro upload:', err);
                alert('Erro ao fazer upload da imagem');
                return;
            }
        }

        const payload = { nome, tipo, valor: parseFloat(valor), imagem: imagemPath };

        try {
            const response = await fetch('/api/admin/produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('adminToken')
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Produto cadastrado!');
                form.reset();
                carregarProdutos();
            } else {
                const err = await response.json();
                alert('Erro: ' + err.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão');
        }
    });

    async function carregarProdutos() {
        try {
            const response = await fetch('/api/produtos'); 
            const produtos = await response.json();
            todosProdutos = produtos;
            deselecionarLinha();
            renderizarTabela(produtos);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    function renderizarTabela(produtos) {
        tableBody.innerHTML = '';
        if (produtos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhum produto.</td></tr>';
            return;
        }

        produtos.forEach(p => {
            const tr = document.createElement('tr');
            tr.dataset.id = p.id;
            
            const imgHtml = p.imagem ? `<img src="${p.imagem}" style="height: 50px; width: auto;">` : '-';

            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${imgHtml}</td>
                <td>${p.tipo}</td>
                <td>${p.nome}</td>
                <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
            `;
            tr.addEventListener('click', () => selecionarLinha(tr, p.id));
            tableBody.appendChild(tr);
        });
    }

    function selecionarLinha(row, id) {
        if (selectedRow) selectedRow.classList.remove('selected');
        selectedRow = row;
        selectedProdId = id;
        row.classList.add('selected');
        btnEdit.disabled = false;
        btnDelete.disabled = false;
    }

    function deselecionarLinha() {
        if (selectedRow) selectedRow.classList.remove('selected');
        selectedRow = null;
        selectedProdId = null;
        btnEdit.disabled = true;
        btnDelete.disabled = true;
    }

    btnDelete.addEventListener('click', async () => {
        if (!selectedProdId) return;
        if (!confirm('Excluir este produto?')) return;

        try {
            const res = await fetch(`/api/admin/produtos/${selectedProdId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                alert('Produto excluído!');
                carregarProdutos();
            } else {
                alert('Erro ao excluir');
            }
        } catch (err) {
            console.error(err);
        }
    });

    btnEdit.addEventListener('click', () => {
        if (!selectedProdId) return;
        const p = todosProdutos.find(x => x.id == selectedProdId);
        if (p) abrirModal(p);
    });

    function abrirModal(p) {
        document.getElementById('editId').value = p.id;
        document.getElementById('editNome').value = p.nome;
        document.getElementById('editTipo').value = p.tipo;
        document.getElementById('editValor').value = p.valor;
        modal.style.display = 'block';
    }

    spanClose.onclick = () => modal.style.display = 'none';
    btnCancelar.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const nome = document.getElementById('editNome').value;
        const tipo = document.getElementById('editTipo').value;
        const valor = document.getElementById('editValor').value;
        const fileInput = document.getElementById('editImagem');

        let imagemPath = '';
        
        const oldP = todosProdutos.find(x => x.id == id);
        imagemPath = oldP.imagem;

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': localStorage.getItem('adminToken') },
                    body: formData
                });
                const data = await res.json();
                if (data.path) imagemPath = data.path;
            } catch (err) {
                console.error('Erro upload:', err);
                return;
            }
        }

        const payload = { nome, tipo, valor: parseFloat(valor), imagem: imagemPath };

        try {
            const res = await fetch(`/api/admin/produtos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('adminToken')
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Produto atualizado!');
                modal.style.display = 'none';
                carregarProdutos();
            } else {
                alert('Erro ao atualizar');
            }
        } catch (err) {
            console.error(err);
        }
    });

});

