import { useState, useEffect } from 'react'
import { api } from './api'

function ModalTemplate({ template, onClose, onSalvo }) {
  const isEdit = !!template
  const [form, setForm] = useState({ nome: template?.nome || '', msg: template?.msg || '' })
  const [salvando, setSalvando] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function salvar() {
    if (!form.nome || !form.msg) { alert('Nome e mensagem são obrigatórios'); return }
    setSalvando(true)
    try {
      if (isEdit) await api.put(`/api/templates/${template.id}`, form)
      else await api.post('/api/templates', form)
      onSalvo(); onClose()
    } catch (e) { alert(e.message) }
    setSalvando(false)
  }

  const vars = ['{nome}', '{telefone}', '{pedido}', '{total}', '{retirada}']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 10, padding: 28, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: 20 }}>{isEdit ? '✏️ Editar Template' : '➕ Novo Template'}</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Nome do template</label>
          <input value={form.nome} onChange={set('nome')} placeholder="Ex: aviso_pronto"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Mensagem</label>
          <textarea value={form.msg} onChange={set('msg')} rows={5}
            placeholder="Olá {nome}! Seu pedido está pronto 🍞"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Variáveis:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {vars.map(v => (
              <button key={v} onClick={() => setForm(f => ({ ...f, msg: (f.msg || '') + v }))}
                style={{ padding: '2px 8px', fontSize: 11, borderRadius: 4, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={salvar} disabled={salvando}
            style={{ flex: 1, padding: '9px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            {salvando ? 'Salvando...' : '💾 Salvar'}
          </button>
          <button onClick={onClose}
            style={{ padding: '9px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)

  function carregar() {
    setLoading(true)
    api.get('/api/templates')
      .then(d => { setTemplates(d || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id) {
    if (!confirm('Excluir este template?')) return
    try { await api.delete(`/api/templates/${id}`); carregar() }
    catch (e) { alert(e.message) }
  }

  if (loading) return <p style={{ padding: 32 }}>Carregando templates...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2>📝 Templates</h2>
        <button onClick={carregar}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
        <button onClick={() => setModal('novo')}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
          ➕ Novo Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {templates.length === 0 && (
          <p style={{ color: '#888' }}>Nenhum template criado ainda.</p>
        )}
        {templates.map(t => (
          <div key={t.id} style={{ background: 'white', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>{t.nome}</strong>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setModal(t)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                <button onClick={() => excluir(t.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{t.msg}</p>
          </div>
        ))}
      </div>

      {modal && <ModalTemplate template={modal === 'novo' ? null : modal} onClose={() => setModal(null)} onSalvo={carregar} />}
    </div>
  )
}