import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [novo, setNovo] = useState({ nome: '', msg: '' })
  const [mostraNovo, setMostraNovo] = useState(false)

  function carregar() {
    setLoading(true)
    fetch(`${API}/api/templates`)
      .then(r => r.json())
      .then(data => {
        setTemplates(data.templates || data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  function salvarNovo() {
    if (!novo.nome || !novo.msg) { alert('Preencha nome e mensagem'); return }
    fetch(`${API}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    })
    .then(() => {
      setNovo({ nome: '', msg: '' })
      setMostraNovo(false)
      carregar()
    })
    .catch(() => alert('Erro ao salvar'))
  }

  function excluir(id) {
    if (!confirm('Excluir este template?')) return
    fetch(`${API}/api/templates/${id}`, { method: 'DELETE' })
      .then(() => carregar())
      .catch(() => alert('Erro ao excluir'))
  }

  if (loading) return <p>Carregando templates...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2>📝 Templates</h2>
        <button onClick={() => setMostraNovo(!mostraNovo)}
          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer' }}>
          + Novo
        </button>
        <button onClick={carregar}
          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      {mostraNovo && (
        <div style={{ background: 'white', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 12 }}>Novo Template</h3>
          <input
            placeholder="Nome do template"
            value={novo.nome}
            onChange={e => setNovo({ ...novo, nome: e.target.value })}
            style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 10 }}
          />
          <textarea
            placeholder="Mensagem... use {nome} para personalizar"
            value={novo.msg}
            onChange={e => setNovo({ ...novo, msg: e.target.value })}
            rows={4}
            style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 10, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={salvarNovo}
              style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer' }}>
              Salvar
            </button>
            <button onClick={() => setMostraNovo(false)}
              style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {templates.length === 0 && (
          <p style={{ color: '#888' }}>Nenhum template criado ainda.</p>
        )}
        {templates.map(t => (
          <div key={t.id} style={{ background: 'white', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{t.nome}</strong>
              <button onClick={() => excluir(t.id)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: 16 }}>
                🗑️
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{t.msg}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Templates
