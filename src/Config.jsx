import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function Config() {
  const [form, setForm]     = useState({ bot_url: '', waha_url: '', waha_key: '', waha_session: '' })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [status, setStatus] = useState(null) // null | 'ok' | 'erro'

  useEffect(() => {
    fetch(`${API}/api/config`)
      .then(r => r.json())
      .then(data => {
        setForm(data.config || data || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function salvar() {
    setSalvando(true)
    fetch(`${API}/api/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(() => {
      setSalvando(false)
      setStatus('ok')
      setTimeout(() => setStatus(null), 3000)
    })
    .catch(() => {
      setSalvando(false)
      setStatus('erro')
    })
  }

  async function testarConexao() {
    try {
      const r = await fetch(`${API}/health`)
      if (r.ok) setStatus('ok')
      else setStatus('erro')
    } catch {
      setStatus('erro')
    }
    setTimeout(() => setStatus(null), 3000)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const campos = [
    { key: 'bot_url',      label: 'URL do Bot',         placeholder: 'https://bakery-production-ea1e.up.railway.app' },
    { key: 'waha_url',     label: 'URL do UazAPI',      placeholder: 'https://acampamento.uazapi.com' },
    { key: 'waha_key',     label: 'Token UazAPI',       placeholder: 'b1ff3768-...' },
    { key: 'waha_session', label: 'Instância',          placeholder: 'padaria-igreja' },
  ]

  if (loading) return <p>Carregando configurações...</p>

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 24 }}>⚙️ Configurações</h2>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>🔧 Sistema</h3>
        {campos.map(c => (
          <div key={c.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>
              {c.label}
            </label>
            <input
              value={form[c.key] || ''}
              onChange={set(c.key)}
              placeholder={c.placeholder}
              type={c.key.includes('key') ? 'password' : 'text'}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={salvar} disabled={salvando}
            style={{ padding: '9px 20px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            {salvando ? 'Salvando...' : '💾 Salvar'}
          </button>
          <button onClick={testarConexao}
            style={{ padding: '9px 20px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
            🔌 Testar conexão
          </button>
        </div>

        {status === 'ok' && (
          <p style={{ marginTop: 12, color: '#155724', background: '#d4edda', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
            ✅ Servidor online e configurações salvas!
          </p>
        )}
        {status === 'erro' && (
          <p style={{ marginTop: 12, color: '#721c24', background: '#f8d7da', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
            ❌ Erro ao conectar com o servidor.
          </p>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12, fontSize: 15 }}>ℹ️ Informações</h3>
        {[
          ['Frontend', 'React + Vite (StackBlitz → Netlify)'],
          ['Backend',  'Node.js / Express (Railway)'],
          ['Banco',    'PostgreSQL (Railway)'],
          ['Cache',    'Redis (Railway)'],
          ['WhatsApp', 'UazAPI'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, width: 80 }}>{k}</span>
            <span style={{ color: '#666' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Config