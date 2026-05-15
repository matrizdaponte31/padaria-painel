import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Bot() {
  const [mensagens, setMensagens] = useState({})
  const [loading, setLoading]     = useState(true)
  const [salvando, setSalvando]   = useState({})
  const [salvo, setSalvo]         = useState({})

  const info = {
    boas_vindas:       { label: '👋 Boas-vindas',      desc: 'Primeira mensagem ao cliente' },
    pedido_confirmado: { label: '✅ Pedido confirmado', desc: 'Enviada quando cliente digita SIM' },
    pedido_cancelado:  { label: '❌ Pedido cancelado',  desc: 'Enviada quando cliente digita NÃO' },
    aviso_pronto:      { label: '🛍️ Pedido pronto',    desc: 'Enviada pelo painel quando pronto' },
  }

  useEffect(() => {
    fetch(`${API}/api/mensagens`)
      .then(r => r.json())
      .then(data => {
        const arr = data.mensagens || data || []
        const obj = {}
        arr.forEach(m => { obj[m.chave] = m.texto })
        setMensagens(obj)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function salvar(chave) {
    setSalvando(s => ({ ...s, [chave]: true }))
    try {
      await fetch(`${API}/api/mensagens/${chave}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: mensagens[chave] })
      })
      setSalvo(s => ({ ...s, [chave]: true }))
      setTimeout(() => setSalvo(s => ({ ...s, [chave]: false })), 2000)
    } catch { alert('Erro ao salvar') }
    setSalvando(s => ({ ...s, [chave]: false }))
  }

  if (loading) return <p style={{ padding: 32 }}>Carregando mensagens...</p>

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>🤖 Mensagens do Bot</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>
        Edite as mensagens enviadas automaticamente pelo Rafael.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {Object.entries(info).map(([chave, i]) => (
          <div key={chave} style={{ background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: 4, fontSize: 15 }}>{i.label}</h3>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>{i.desc}</p>
            <textarea
              value={mensagens[chave] || ''}
              onChange={e => setMensagens(m => ({ ...m, [chave]: e.target.value }))}
              rows={5}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['{nome}', '{pedido}', '{total}', '{retirada}'].map(v => (
                <button key={v}
                  onClick={() => setMensagens(m => ({ ...m, [chave]: (m[chave] || '') + v }))}
                  style={{ padding: '2px 8px', fontSize: 11, borderRadius: 4, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}>
                  {v}
                </button>
              ))}
              <button onClick={() => salvar(chave)} disabled={salvando[chave]}
                style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 6, border: 'none', background: salvo[chave] ? '#28a745' : '#c8660a', color: 'white', cursor: 'pointer', fontSize: 13, transition: 'background .3s' }}>
                {salvando[chave] ? 'Salvando...' : salvo[chave] ? '✓ Salvo!' : '💾 Salvar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Bot