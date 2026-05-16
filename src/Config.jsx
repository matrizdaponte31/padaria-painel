import { useState, useEffect } from 'react'
import { api } from './api'

export default function Config() {
  const [form, setForm]         = useState({ bot_url: '', waha_url: '', waha_key: '', waha_session: '' })
  const [loading, setLoading]   = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [status, setStatus]     = useState(null)
  const [testando, setTestando] = useState(false)

  useEffect(() => {
    api.get('/api/config')
      .then(d => { setForm(d || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function salvar() {
    setSalvando(true)
    try {
      await api.put('/api/config', form)
      setStatus('ok')
      setTimeout(() => setStatus(null), 3000)
    } catch (e) {
      alert(e.message)
      setStatus('erro')
    }
    setSalvando(false)
  }

  async function testar() {
    setTestando(true)
    setStatus(null)
    try {
      await api.get('/health')
      setStatus('ok')
    } catch {
      setStatus('erro')
    }
    setTestando(false)
    setTimeout(() => setStatus(null), 4000)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const campos = [
    { key: 'bot_url',      label: '🤖 URL do Bot',    placeholder: 'https://bakery-production-ea1e.up.railway.app' },
    { key: 'waha_url',     label: '📱 URL do UazAPI', placeholder: 'https://acampamento.uazapi.com' },
    { key: 'waha_key',     label: '🔑 Token UazAPI',  placeholder: 'b1ff3768-...' },
    { key: 'waha_session', label: '📌 Instância',     placeholder: 'padaria-igreja' },
  ]

  if (loading) return <p style={{ padding: 32 }}>Carregando configurações...</p>

  return (
    <div style={{ maxWidth: 580 }}>
      <h2 style={{ marginBottom: 24 }}>⚙️ Configurações</h2>

      {/* Conexão */}
      <div style={{ background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>🔌 Conexão com o Servidor</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <code style={{ flex: 1, background: '#f5f5f5', padding: '8px 12px', borderRadius: 6, fontSize: 12 }}>
            https://bakery-production-ea1e.up.railway.app
          </code>
          <button onClick={testar} disabled={testando}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {testando ? '⏳ Testando...' : '🔌 Testar'}
          </button>
        </div>
        {status === 'ok' && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
            ✅ Servidor online!
          </div>
        )}
        {status === 'erro' && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
            ❌ Servidor inacessível.
          </div>
        )}
      </div>

      {/* Configurações */}
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>🔧 Configurações do Sistema</h3>
        {campos.map(c => (
          <div key={c.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>{c.label}</label>
            <input
              value={form[c.key] || ''}
              onChange={set(c.key)}
              placeholder={c.placeholder}
              type={c.key === 'waha_key' ? 'password' : 'text'}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <button onClick={salvar} disabled={salvando}
          style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600, marginTop: 8 }}>
          {salvando ? 'Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>

      {/* Info */}
      <div style={{ background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12, fontSize: 15 }}>ℹ️ Infraestrutura</h3>
        {[
          ['🌐 Frontend',  'React + Vite → Netlify'],
          ['⚙️ Backend',   'Node.js / Express → Railway'],
          ['🗄️ Banco',     'PostgreSQL → Railway'],
          ['⚡ Cache',     'Redis → Railway'],
          ['📱 WhatsApp',  'UazAPI → acampamento.uazapi.com'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, width: 110 }}>{k}</span>
            <span style={{ color: '#666' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}