import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Contatos() {
  const [contatos, setContatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

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

  const filtrados = contatos.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca)
  )

  if (loading) return <p>Carregando contatos...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2>👥 Contatos ({contatos.length})</h2>
        <button onClick={carregar}
          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      <input
        placeholder="🔍 Buscar por nome ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 16, width: 300 }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f0ece4', fontSize: 13 }}>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Telefone</th>
            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Grupo</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#888' }}>Nenhum contato encontrado</td></tr>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Contatos
