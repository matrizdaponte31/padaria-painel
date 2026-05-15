import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  function carregarPedidos() {
    setLoading(true)
    fetch(`${API}/api/pedidos`)
      .then(r => r.json())
      .then(data => {
        setPedidos(data.pedidos || data || [])
        setLoading(false)
      })
      .catch(() => {
        setErro('Erro ao conectar com o servidor')
        setLoading(false)
      })
  }

  useEffect(() => { carregarPedidos() }, [])

  function mudarStatus(id, novoStatus) {
    fetch(`${API}/api/pedidos/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    })
    .then(() => carregarPedidos())
    .catch(() => alert('Erro ao atualizar status'))
  }

  const corStatus = {
    pendente:  { background: '#fff3cd', color: '#856404' },
    pronto:    { background: '#cce5ff', color: '#004085' },
    entregue:  { background: '#d4edda', color: '#155724' },
    cancelado: { background: '#f8d7da', color: '#721c24' },
    separado:  { background: '#ffe5cc', color: '#c8660a' },
  }

  if (loading) return <p>Carregando pedidos...</p>
  if (erro)    return <p style={{ color: 'red' }}>{erro}</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        <h2>📋 Pedidos ({pedidos.length})</h2>
        <button onClick={carregarPedidos}
          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f0ece4', fontSize: 13 }}>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Cliente</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Pedido</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Total</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Retirada</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '12px 16px', color: '#999' }}>{p.id}</td>
              <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                <div>{p.nome}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{p.telefone}</div>
              </td>
              <td style={{ padding: '12px 16px', color: '#555', maxWidth: 200 }}>{p.pedido}</td>
              <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                R$ {Number(p.total || 0).toFixed(2)}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <select
                  value={p.status}
                  onChange={e => mudarStatus(p.id, e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    fontSize: 12,
                    cursor: 'pointer',
                    ...(corStatus[p.status] || {})
                  }}>
                  <option value="pendente">pendente</option>
                  <option value="separado">separado</option>
                  <option value="pronto">pronto</option>
                  <option value="entregue">entregue</option>
                  <option value="cancelado">cancelado</option>
                </select>
              </td>
              <td style={{ padding: '12px 16px', color: '#555' }}>{p.retirada || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Pedidos
