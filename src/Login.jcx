import { useState } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    if (!usuario || !senha) { setErro('Preencha usuário e senha'); return }
    setLoading(true)
    setErro('')
    try {
      const r = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      })
      const data = await r.json()
      if (!r.ok) { setErro(data.error || 'Erro ao entrar'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify({ nome: data.nome, nivel: data.nivel }))
      onLogin({ nome: data.nome, nivel: data.nivel, token: data.token })
    } catch { setErro('Erro ao conectar com o servidor') }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ width: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🍞</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Padaria da Matriz
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
            Painel Administrativo
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: '#2a1f12' }}>
            Entrar
          </h2>

          <form onSubmit={entrar}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: '#555' }}>
                Usuário
              </label>
              <input
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="seu.usuario"
                autoComplete="username"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: '#555' }}>
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {erro && (
              <div style={{ background: '#fde8e8', color: '#b83232', padding: '9px 12px', borderRadius: 7, fontSize: 13, marginBottom: 14 }}>
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px', borderRadius: 7, border: 'none', background: loading ? '#ccc' : '#c8660a', color: 'white', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 12, marginTop: 20 }}>
          Padaria da Matriz © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}