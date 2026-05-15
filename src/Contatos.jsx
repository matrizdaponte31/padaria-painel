import { useState, useEffect, useRef } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Contatos() {
  const [contatos, setContatos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [busca, setBusca]         = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState({ nome: '', telefone: '', grupo: '' })
  const [salvando, setSalvando]   = useState(false)
  const [importando, setImportando] = useState(false)
  const fileRef                   = useRef()

  function carregar() {
    setLoading(true)
    fetch(`${API}/api/contatos`)
      .then(r => r.json())
      .then(data => {
        setContatos(data.contatos || data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm({ nome: '', telefone: '', grupo: '' })
    setModal('novo')
  }

  function abrirEditar(c) {
    setForm({ nome: c.nome, telefone: c.telefone, grupo: c.grupo || '' })
    setModal(c)
  }

  async function salvar() {
    if (!form.nome || !form.telefone) { alert('Nome e telefone são obrigatórios'); return }
    setSalvando(true)
    try {
      if (modal === 'novo') {
        await fetch(`${API}/api/contatos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        await fetch(`${API}/api/contatos/${modal.id}`, {
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
    if (!confirm(`Excluir ${nome}?`)) return
    try {
      await fetch(`${API}/api/contatos/${id}`, { method: 'DELETE' })
      carregar()
    } catch { alert('Erro ao excluir') }
  }

  function importarCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    setImportando(true)
    const reader = new FileReader()
    reader.onload = async ev => {
      const lines = ev.target.result.split('\n').filter(Boolean)
      if (lines.length < 2) { alert('CSV vazio ou inválido'); setImportando(false); return }

      // Detecta cabeçalho
      const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
      const idxNome = header.findIndex(h => h.includes('name') || h.includes('nome'))
      const idxFone = header.findIndex(h => h.includes('phone') || h.includes('telefone') || h.includes('número'))

      if (idxNome === -1 || idxFone === -1) {
        alert('CSV inválido — precisa ter colunas de Nome e Telefone')
        setImportando(false)
        return
      }

      const rows = lines.slice(1).map(line => {
        const cols = line.match(/(".*?"|[^,]+)/g) || []
        const clean = cols.map(c => c.replace(/"/g, '').trim())
        const telefone = (clean[idxFone] || '').replace(/\D/g, '')
        return { nome: clean[idxNome] || '', telefone, grupo: '' }
      }).filter(r => r.nome && r.telefone && r.telefone.length >= 10)

      if (rows.length === 0) { alert('Nenhum contato válido encontrado no CSV'); setImportando(false); return }

      try {
        const r = await fetch(`${API}/api/contatos/importar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contatos: rows })
        })
        const d = await r.json()
        alert(`✅ ${d.importados || rows.length} contatos importados!`)
        carregar()
      } catch { alert('Erro ao importar contatos') }
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

      {/* Stats */}
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

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2>👥 Contatos ({filtrados.length})</h2>

        <input
          placeholder="🔍 Buscar nome, telefone, grupo..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
        />

        <button onClick={carregar}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>

        <button onClick={() => fileRef.current.click()} disabled={importando}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          {importando ? '⏳ Importando...' : '📥 Importar CSV'}
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importarCSV} />

        <button onClick={abrirNovo}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
          ➕ Novo Contato
        </button>
      </div>

      {/* Dica CSV */}
      <div style={{ background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#c8660a' }}>
        💡 <b>Importar CSV:</b> exporte seus contatos do Google Contacts em formato CSV e importe aqui. O sistema detecta automaticamente as colunas de nome e telefone.
      </div>

      {/* Tabela */}
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
                  {c.grupo && (
                    <span style={{ background: '#f0ece4', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>
                      {c.grupo}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => abrirEditar(c)}
                      title="Editar" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>✏️</button>
                    <button onClick={() => excluir(c.id, c.nome)}
                      title="Excluir" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 10, padding: 28, width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: 20 }}>{modal === 'novo' ? '➕ Novo Contato' : '✏️ Editar Contato'}</h3>
            {[
              { key: 'nome',     label: 'Nome *',                  placeholder: 'Maria Silva' },
              { key: 'telefone', label: 'Telefone * (com código)', placeholder: '5548999887766' },
              { key: 'grupo',    label: 'Grupo',                   placeholder: 'clientes, vip...' },
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
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
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

export default Contatos