import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Pedidos() {
  const [pedidos, setPedidos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [erro, setErro]             = useState(null)
  const [busca, setBusca]           = useState('')
  const [filtroStatus, setFiltro]   = useState('')

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

  function imprimir(p) {
    const w = window.open('', '_blank', 'width=400,height=500')
    w.document.write(`
      <html><head><title>Pedido #${p.id}</title>
      <style>body{font-family:sans-serif;padding:20px;font-size:14px}
      h2{margin-bottom:12px}.row{margin:6px 0}hr{margin:12px 0;border:none;border-top:1px solid #eee}</style>
      </head><body>
      <h2>🍞 Padaria da Matriz</h2>
      <hr/>
      <div class="row"><b>Pedido #${p.id}</b></div>
      <div class="row"><b>Cliente:</b> ${p.nome}</div>
      <div class="row"><b>Telefone:</b> ${p.telefone || '—'}</div>
      <hr/>
      <div class="row"><b>Itens:</b> ${p.pedido}</div>
      <div class="row"><b>Total:</b> ${p.total || '—'}</div>
      <hr/>
      <div class="row"><b>Retirada:</b> ${p.retirada || '—'}</div>
      <div class="row"><b>Status:</b> ${p.status}</div>
      <script>window.print();window.close()</script>
      </body></html>`)
    w.document.close()
  }

  const corStatus = {
    pendente:  { background: '#fff3cd', color: '#856404' },
    pronto:    { background: '#cce5ff', color: '#004085' },
    entregue:  { background: '#d4edda', color: '#155724' },
    cancelado: { background: '#f8d7da', color: '#721c24' },
    separado:  { background: '#ffe5cc', color: '#c8660a' },
    Pendente:  { background: '#fff3cd', color: '#856404' },
    Pronto:    { background: '#cce5ff', color: '#004085' },
    Entregue:  { background: '#d4edda', color: '#155724' },
    Cancelado: { background: '#f8d7da', color: '#721c24' },
  }

  const filtrados = pedidos.filter(p => {
    const q = busca.toLowerCase()
    const matchBusca = !q || p.nome?.toLowerCase().includes(q) || p.pedido?.toLowerCase().includes(q) || p.telefone?.includes(q)
    const matchStatus = !filtroStatus || p.status?.toLowerCase() === filtroStatus.toLowerCase()
    return matchBusca && matchStatus
  })

  // Stats
  const total     = pedidos.length
  const pendentes = pedidos.filter(p => p.status?.toLowerCase() === 'pendente').length
  const prontos   = pedidos.filter(p => p.status?.toLowerCase() === 'pronto').length
  const entregues = pedidos.filter(p => p.status?.toLowerCase() === 'entregue').length

  function somarTotal() {
    return pedidos
      .filter(p => p.status?.toLowerCase() !== 'cancelado')
      .reduce((acc, p) => {
        const n = parseFloat(String(p.total || '0').replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0
        return acc + n
      }, 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) return <p style={{ padding: 32 }}>Carregando pedidos...</p>
  if (erro)    return <p style={{ padding: 32, color: 'red' }}>{erro}</p>

  return (
    <div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',     valor: total,     cor: '#2a1f12' },
          { label: 'Pendentes', valor: pendentes,  cor: '#856404' },
          { label: 'Prontos',   valor: prontos,    cor: '#004085' },
          { label: 'Receita',   valor: somarTotal(), cor: '#155724' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.cor }}>{s.valor}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2>📋 Pedidos ({filtrados.length})</h2>

        <input
          placeholder="🔍 Buscar nome, pedido, telefone..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
        />

        <select value={filtroStatus} onChange={e => setFiltro(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd' }}>
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="separado">Separado</option>
          <option value="pronto">Pronto</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <button onClick={carregarPedidos}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f0ece4', fontSize: 13 }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Pedido</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Retirada</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#888' }}>Nenhum pedido encontrado</td></tr>
            )}
            {filtrados.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px', color: '#999' }}>{p.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                  <div>{p.nome}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{p.telefone}</div>
                </td>
                <td style={{ padding: '12px 16px', color: '#555', maxWidth: 220 }}>{p.pedido}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.total || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <select
                    value={p.status}
                    onChange={e => mudarStatus(p.id, e.target.value)}
                    style={{
                      padding: '4px 8px', borderRadius: 6,
                      border: '1px solid #ddd', fontSize: 12, cursor: 'pointer',
                      ...(corStatus[p.status] || {})
                    }}>
                    <option value="pendente">pendente</option>
                    <option value="separado">separado</option>
                    <option value="pronto">pronto</option>
                    <option value="entregue">entregue</option>
                    <option value="cancelado">cancelado</option>
                  </select>
                </td>
                <td style={{ padding: '12px 16px', color: '#555', fontSize: 13 }}>{p.retirada || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => imprimir(p)}
                    title="Imprimir pedido"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>
                    🖨️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Pedidos