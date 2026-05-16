import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function ModalHistorico({ onClose }) {
  const [meses, setMeses]     = useState([])
  const [sel, setSel]         = useState(null)
  const [dados, setDados]     = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/historico`)
      .then(r => r.json())
      .then(d => setMeses(d.meses || d || []))
      .catch(() => {})
  }, [])

  async function carregarMes(m) {
    setSel(m)
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/historico/${m.mes}/${m.ano}`)
      const d = await r.json()
      setDados(d.pedidos || d || [])
    } catch { setDados([]) }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 10, width: 800, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>📦 Histórico de Pedidos</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: 160, borderRight: '1px solid #eee', padding: 16, overflowY: 'auto' }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Selecione o mês</p>
            {meses.length === 0 && <p style={{ fontSize: 13, color: '#aaa' }}>Nenhum mês arquivado</p>}
            {meses.map((m, i) => (
              <button key={i} onClick={() => carregarMes(m)}
                style={{ display: 'block', width: '100%', padding: '8px 12px', marginBottom: 4, borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, background: sel === m ? '#c8660a' : '#f5f5f5', color: sel === m ? 'white' : '#333' }}>
                {String(m.mes).padStart(2, '0')}/{m.ano}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {!sel && <p style={{ color: '#aaa', fontSize: 13 }}>← Selecione um mês</p>}
            {loading && <p style={{ color: '#888', fontSize: 13 }}>Carregando...</p>}
            {!loading && sel && dados.length === 0 && <p style={{ color: '#aaa', fontSize: 13 }}>Nenhum pedido neste mês.</p>}
            {!loading && dados.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f0ece4' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Cliente</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Pedido</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map(p => (
                    <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '8px 12px', color: '#999' }}>{p.id}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{p.nome}</td>
                      <td style={{ padding: '8px 12px', color: '#555', maxWidth: 200 }}>{p.pedido}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.total || '—'}</td>
                      <td style={{ padding: '8px 12px' }}>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #eee', textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function ModalPedidoManual({ onClose, onSalvo }) {
  const [form, setForm] = useState({ nome: '', telefone: '', pedido: '', total: '', retirada: '', status: 'pendente' })
  const [salvando, setSalvando] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function salvar() {
    if (!form.nome || !form.pedido) { alert('Nome e pedido são obrigatórios'); return }
    setSalvando(true)
    try {
      await fetch(`${API}/api/pedidos/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      onSalvo()
      onClose()
    } catch { alert('Erro ao salvar pedido') }
    setSalvando(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 10, padding: 28, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: 20 }}>➕ Pedido Manual</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Nome *</label>
            <input value={form.nome} onChange={set('nome')} placeholder="Maria Silva"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Telefone</label>
            <input value={form.telefone} onChange={set('telefone')} placeholder="5548999887766"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Pedido *</label>
          <textarea value={form.pedido} onChange={set('pedido')} placeholder="Cuca Farofa G x1, Pão de Trança x2..."
            rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Total</label>
            <input value={form.total} onChange={set('total')} placeholder="R$ 50,00"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Retirada</label>
            <input value={form.retirada} onChange={set('retirada')} placeholder="Sexta-feira das 10h-12h"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Status</label>
          <select value={form.status} onChange={set('status')}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}>
            <option value="pendente">Pendente</option>
            <option value="separado">Separado</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={salvar} disabled={salvando}
            style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            {salvando ? 'Salvando...' : '💾 Salvar Pedido'}
          </button>
          <button onClick={onClose}
            style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function Pedidos() {
  const [pedidos, setPedidos]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [erro, setErro]               = useState(null)
  const [busca, setBusca]             = useState('')
  const [filtroStatus, setFiltro]     = useState('')
  const [aviso, setAviso]             = useState(null)
  const [verHistorico, setHistorico]  = useState(false)
  const [verManual, setManual]        = useState(false)

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

  async function avisarCliente(p) {
    if (!p.telefone) { alert('Este pedido não tem telefone cadastrado'); return }
    if (!confirm(`Avisar ${p.nome} que o pedido está pronto?`)) return
    setAviso(p.id)
    try {
      await fetch(`${API}/api/disparar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contatos: [p.telefone],
          mensagem: `Olá ${p.nome}! 🍞 Seu pedido está pronto para retirada!\n\n📦 *Pedido:* ${p.pedido}\n💰 *Total:* ${p.total}\n🕐 *Retirada:* ${p.retirada}\n\nObrigada pela preferência! 😊`,
          delay: 0
        })
      })
      alert(`✅ Mensagem enviada para ${p.nome}!`)
    } catch { alert('Erro ao enviar mensagem') }
    setAviso(null)
  }

  async function fecharMes() {
    if (!confirm('Fechar o mês? Todos os pedidos entregues e cancelados serão arquivados.')) return
    try {
      const r = await fetch(`${API}/api/pedidos/arquivar`, { method: 'POST' })
      const data = await r.json()
      alert(`✅ ${data.arquivados || 0} pedidos arquivados!`)
      carregarPedidos()
    } catch { alert('Erro ao fechar o mês') }
  }

  function imprimir(p) {
    const w = window.open('', '_blank', 'width=400,height=500')
    w.document.write(`
      <html><head><title>Pedido #${p.id}</title>
      <style>body{font-family:sans-serif;padding:20px;font-size:14px}
      h2{margin-bottom:12px}.row{margin:6px 0}hr{margin:12px 0;border:none;border-top:1px solid #eee}</style>
      </head><body>
      <h2>🍞 Padaria da Matriz</h2><hr/>
      <div class="row"><b>Pedido #${p.id}</b></div>
      <div class="row"><b>Cliente:</b> ${p.nome}</div>
      <div class="row"><b>Telefone:</b> ${p.telefone || '—'}</div><hr/>
      <div class="row"><b>Itens:</b> ${p.pedido}</div>
      <div class="row"><b>Total:</b> ${p.total || '—'}</div><hr/>
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

  const total     = pedidos.length
  const pendentes = pedidos.filter(p => p.status?.toLowerCase() === 'pendente').length
  const prontos   = pedidos.filter(p => p.status?.toLowerCase() === 'pronto').length

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
          { label: 'Total',     valor: total,       cor: '#2a1f12' },
          { label: 'Pendentes', valor: pendentes,    cor: '#856404' },
          { label: 'Prontos',   valor: prontos,      cor: '#004085' },
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

        <button onClick={() => setHistorico(true)}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          📦 Histórico
        </button>

        <button onClick={() => setManual(true)}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer' }}>
          ➕ Pedido Manual
        </button>

        <button onClick={fecharMes}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
          📦 Fechar Mês
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
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, cursor: 'pointer', ...(corStatus[p.status] || {}) }}>
                    <option value="pendente">pendente</option>
                    <option value="separado">separado</option>
                    <option value="pronto">pronto</option>
                    <option value="entregue">entregue</option>
                    <option value="cancelado">cancelado</option>
                  </select>
                </td>
                <td style={{ padding: '12px 16px', color: '#555', fontSize: 13 }}>{p.retirada || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => avisarCliente(p)} disabled={aviso === p.id}
                      title="Avisar cliente no WhatsApp"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>
                      {aviso === p.id ? '⏳' : '💬'}
                    </button>
                    <button onClick={() => imprimir(p)}
                      title="Imprimir pedido"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>
                      🖨️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verHistorico && <ModalHistorico onClose={() => setHistorico(false)} />}
      {verManual    && <ModalPedidoManual onClose={() => setManual(false)} onSalvo={carregarPedidos} />}
    </div>
  )
}

export default Pedidos