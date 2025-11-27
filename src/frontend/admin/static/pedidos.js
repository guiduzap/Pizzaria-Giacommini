
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#pedidosTable tbody');
    const btnRefresh = document.getElementById('btnRefresh');

    let clientesMap = {};
    let produtosMap = {};

    carregarDados();

    btnRefresh.addEventListener('click', carregarDados);

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('adminToken')
        };
    }

    async function carregarDados() {
        try {
            
            const [resClientes, resProdutos] = await Promise.all([
                fetch('/api/admin/clientes', { headers: getHeaders() }),
                fetch('/api/produtos')
            ]);

            if (resClientes.ok) {
                const clientes = await resClientes.json();
                clientes.forEach(c => clientesMap[c.id] = c.nome);
            }

            if (resProdutos.ok) {
                const produtos = await resProdutos.json();
                produtos.forEach(p => produtosMap[p.id] = p.nome);
            }

            const resPedidos = await fetch('/api/admin/pedidos', { headers: getHeaders() });
            if (resPedidos.ok) {
                const pedidos = await resPedidos.json();
                renderizarTabela(pedidos);
            } else {
                console.error('Erro ao buscar pedidos');
            }

        } catch (err) {
            console.error('Erro:', err);
        }
    }

    function renderizarTabela(pedidos) {
        tableBody.innerHTML = '';
        if (pedidos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center">Nenhum pedido.</td></tr>';
            return;
        }

        pedidos.reverse().forEach(p => {
            const tr = document.createElement('tr');
            
            const nomeCliente = clientesMap[p.idcliente] || `ID: ${p.idcliente}`;
            const nomeProduto = produtosMap[p.idproduto] || `ID: ${p.idproduto}`;
            
            let statusColor = '#f1c40f'; 
            if (p.status === 'concluido' || p.status === 'entregue') statusColor = '#2ecc71';
            if (p.status === 'cancelado') statusColor = '#e74c3c';

            tr.innerHTML = `
                <td>${p.index}</td>
                <td>${p.data}</td>
                <td>${nomeCliente}</td>
                <td>${nomeProduto}</td>
                <td>R$ ${parseFloat(p.custototal).toFixed(2)}</td>
                <td>${p.formapagamento}</td>
                <td><span style="background:${statusColor}; color:white; padding:2px 5px; border-radius:3px;">${p.status}</span></td>
                <td>
                    <select class="status-select" onchange="atualizarStatus(${p.index}, this.value)">
                        <option value="">Mudar Status...</option>
                        <option value="pending">Pendente</option>
                        <option value="preparando">Preparando</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.atualizarStatus = async (index, novoStatus) => {
        if (!novoStatus) return;
        try {
            const res = await fetch(`/api/admin/pedidos/${index}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status: novoStatus })
            });
            if (res.ok) {
                alert('Status atualizado!');
                carregarDados();
            } else {
                alert('Erro ao atualizar status');
            }
        } catch (err) {
            console.error(err);
        }
    };
});

