import { useState, useEffect, useRef } from 'react'
import { api } from './api'

function ModalContato({ contato, onClose, onSalvo }) {
  const isEdit = !!contato
  const [form, setForm] = useState({
    nome:     contato?.nome     || '',
    telefone: contato?.telefone || '',
    grupo:    contato?.grupo    || '',
  })
  const [salvando, setSalvando] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function salvar() {
    if (!form.nome || !form.telefone) { alert('Nome e telefone são obrigatórios'); return }
    setSalvando(true)
    try {
      if (isEdit) await api.put(`/api/contatos/${contato.id}`, form)
      else await api.post('/api/contatos', form)
      onSalvo(); onClose()
    } catch (e) { alert(e.message) }
    setSalvando(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 10, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: 20 }}>{isEdit ? '✏️ Editar Contato' : '➕ Novo Contato'}</h3>
        {[
          { key: 'nome',     label: 'Nome *',                  placeholder: 'Maria Silva' },
          { key: 'telefone', label: 'Telefone * (com código)', placeholder: '5548999887766' },
          { key: 'grupo',    label: 'Grupo',                   placeholder: 'clientes, vip...' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>{f.label}</label>
            <input value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
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

export default function Contatos() {
  const [contatos, setContatos]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [busca, setBusca]           = useState('')
  const [modal, setModal]           = useState(null)
  const [importando, setImportando] = useState(false)
  const fileRef                     = useRef()

  function carregar() {
    setLoading(true)
    api.get('/api/contatos')
      .then(d => { setContatos(d || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id, nome) {
    if (!confirm(`Excluir ${nome}?`)) return
    try { await api.delete(`/api/contatos/${id}`); carregar() }
    catch (e) { alert(e.message) }
  }

  function importarCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    setImportando(true)
    const reader = new FileReader()
    reader.onload = async ev => {
      const lines = ev.target.result.split('\n').filter(Boolean)
      if (lines.length < 2) { alert('CSV vazio ou inválido'); setImportando(false); return }
      const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
      const idxNome = header.findIndex(h => h.includes('name') || h.includes('nome'))
      const idxFone = header.findIndex(h => h.includes('phone') || h.includes('telefone') || h.includes('número'))
      if (idxNome === -1 || idxFone === -1) { alert('CSV inválido — precisa ter colunas de Nome e Telefone'); setImportando(false); return }
      const rows = lines.slice(1).map(line => {
        const cols = line.match(/(".*?"|[^,]+)/g) || []
        const clean = cols.map(c => c.replace(/"/g, '').trim())
        const telefone = (clean[idxFone] || '').replace(/\D/g, '')
        return { nome: clean[idxNome] || '', telefone, grupo: '' }
      }).filter(r => r.nome && r.telefone && r.telefone.length >= 10)
      if (rows.length === 0) { alert('Nenhum contato válido encontrado'); setImportando(false); return }
      try {
        const r = await api.post('/api/contatos/importar', { contatos: rows })
        alert(`✅ ${r.inseridos || rows.length} contatos importados!`)
        carregar()
      } catch (e) { alert(e.message) }
      setImportando(false)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtrados = contatos.filter(c => {
    const q = busca.toLowerCase()
    return !q || c.nome?.toLowerCase().includes(q) || c.telefone?.includes(q) || c.grupo?.toLowerCase().includes(q)
  })

  const grupos = [...new Set(contatos.map(c => c.grupo).filter(Boolean))]

  if (loading) return <p style={{ padding: 32 }}>Carregando contatos...</p>

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',     valor: contatos.length },
          { label: 'Grupos',    valor: grupos.length },
          { label: 'Sem grupo', valor: contatos.filter(c => !c.grupo).length },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{s.valor}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2>👥 Contatos ({filtrados.length})</h2>
        <input placeholder="🔍 Buscar nome, telefone, grupo..." value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd', width: 240 }} />
        <button onClick={carregar}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
        <button onClick={() => fileRef.current.click()} disabled={importando}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          {importando ? '⏳ Importando...' : '📥 Importar CSV'}
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importarCSV} />
        <button onClick={() => setModal('novo')}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
          ➕ Novo Contato
        </button>
      </div>

      <div style={{ background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#c8660a' }}>
        💡 Importe seus contatos do Google Contacts em formato CSV.
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f0ece4', fontSize: 13 }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Telefone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Grupo</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#888' }}>Nenhum contato encontrado</td></tr>
            )}
            {filtrados.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px', color: '#999' }}>{c.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.nome}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{c.telefone}</td>
                <td style={{ padding: '12px 16px' }}>
                  {c.grupo && <span style={{ background: '#f0ece4', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>{c.grupo}</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setModal(c)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                    <button onClick={() => excluir(c.id, c.nome)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <ModalContato contato={modal === 'novo' ? null : modal} onClose={() => setModal(null)} onSalvo={carregar} />}
    </div>
  )
}