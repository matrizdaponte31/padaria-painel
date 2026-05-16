import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Cardapio() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState({ nome: '', preco: '', categoria: '', disponivel: true })

  function carregar() {
    setLoading(true)
    fetch(`${API}/api/cardapio`)
      .then(r => r.json())
      .then(d => {
        setProdutos(d.produtos || d || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm({ nome: '', preco: '', categoria: '', disponivel: true })
    setModal('novo')
  }

  function abrirEditar(p) {
    setForm({ nome: p.nome, preco: p.preco, categoria: p.categoria || '', disponivel: p.disponivel !== false })
    setModal(p)
  }

  async function salvar() {
    if (!form.nome || !form.preco) { alert('Nome e preço são obrigatórios'); return }
    setSalvando(true)
    try {
      if (modal === 'novo') {
        await fetch(`${API}/api/cardapio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        await fetch(`${API}/api/cardapio/${modal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      setModal(null)
      carregar()
    } catch { alert('Erro ao salvar') }
    setSalvando(false)
  }

  async function excluir(id, nome) {
    if (!confirm(`Excluir "${nome}"?`)) return
    try {
      await fetch(`${API}/api/cardapio/${id}`, { method: 'DELETE' })
      carregar()
    } catch { alert('Erro ao excluir') }
  }

  async function toggleDisponivel(p) {
    try {
      await fetch(`${API}/api/cardapio/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, disponivel: !p.disponivel })
      })
      carregar()
    } catch { alert('Erro ao atualizar') }
  }

  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))]

  if (loading) return <p style={{ padding: 32 }}>Carregando cardápio...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h2>🍰 Cardápio</h2>
        <button onClick={carregar}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
        <button onClick={abrirNovo}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
          ➕ Novo Produto
        </button>
      </div>

      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        Os produtos aqui são os mesmos que o Rafael envia no cardápio pelo WhatsApp. Alterar aqui atualiza automaticamente o bot.
      </p>

      {/* Por categoria */}
      {categorias.length === 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f0ece4', fontSize: 13 }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Produto</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Preço</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Disponível</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#888' }}>Nenhum produto cadastrado ainda</td></tr>
              )}
              {produtos.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px', color: '#999' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, opacity: p.disponivel === false ? .4 : 1 }}>{p.nome}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.preco}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggleDisponivel(p)}
                      style={{ border: 'none', borderRadius: 99, padding: '3px 10px', fontSize: 12, cursor: 'pointer', background: p.disponivel !== false ? '#d4edda' : '#f8d7da', color: p.disponivel !== false ? '#155724' : '#721c24' }}>
                      {p.disponivel !== false ? '✓ Sim' : '✕ Não'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => abrirEditar(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                      <button onClick={() => excluir(p.id, p.nome)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        categorias.map(cat => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, color: '#c8660a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{cat}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ background: '#f0ece4', fontSize: 13 }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Produto</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Preço</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Disponível</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.filter(p => p.categoria === cat).map((p, i) => (
                    <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '10px 16px', color: '#999' }}>{i + 1}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 500, opacity: p.disponivel === false ? .4 : 1 }}>{p.nome}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{p.preco}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <button onClick={() => toggleDisponivel(p)}
                          style={{ border: 'none', borderRadius: 99, padding: '3px 10px', fontSize: 12, cursor: 'pointer', background: p.disponivel !== false ? '#d4edda' : '#f8d7da', color: p.disponivel !== false ? '#155724' : '#721c24' }}>
                          {p.disponivel !== false ? '✓ Sim' : '✕ Não'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => abrirEditar(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                          <button onClick={() => excluir(p.id, p.nome)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 10, padding: 28, width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: 20 }}>{modal === 'novo' ? '➕ Novo Produto' : '✏️ Editar Produto'}</h3>
            {[
              { key: 'nome',      label: 'Nome *',      placeholder: 'Cuca Farofa G' },
              { key: 'preco',     label: 'Preço *',     placeholder: 'R$ 35,00' },
              { key: 'categoria', label: 'Categoria',   placeholder: 'Cucas, Bolos, Tortas...' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={e => setForm(f2 => ({ ...f2, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="disp" checked={form.disponivel}
                onChange={e => setForm(f => ({ ...f, disponivel: e.target.checked }))} />
              <label htmlFor="disp" style={{ fontSize: 13, color: '#555' }}>Disponível no cardápio</label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={salvar} disabled={salvando}
                style={{ flex: 1, padding: '9px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                {salvando ? 'Salvando...' : '💾 Salvar'}
              </button>
              <button onClick={() => setModal(null)}
                style={{ padding: '9px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cardapio