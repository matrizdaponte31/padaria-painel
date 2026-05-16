import { useState, useEffect } from 'react'
import Login    from './Login'
import Pedidos  from './Pedidos'
import Contatos from './Contatos'
import Templates from './Templates'
import Disparar from './Disparar'
import Bot      from './Bot'
import Config   from './Config'
import Cardapio from './Cardapio'
import Usuarios from './Usuarios'

const API = 'https://bakery-production-ea1e.up.railway.app'

export default function App() {
  const [auth, setAuth]         = useState(null) // { nome, nivel, token }
  const [abaAtiva, setAbaAtiva] = useState('pedidos')
  const [checando, setChecando] = useState(true)

  // Verifica se já tem sessão salva
  useEffect(() => {
    const token = localStorage.getItem('token')
    const usuario = localStorage.getItem('usuario')
    if (token && usuario) {
      const u = JSON.parse(usuario)
      // Valida token no servidor
      fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
          if (r.ok) setAuth({ ...u, token })
          else { localStorage.clear() }
        })
        .catch(() => {})
        .finally(() => setChecando(false))
    } else {
      setChecando(false)
    }
  }, [])

  async function logout() {
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API}/api/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    localStorage.clear()
    setAuth(null)
    setAbaAtiva('pedidos')
  }

  if (checando) return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontSize: 16 }}>🍞 Carregando...</div>
    </div>
  )

  if (!auth) return <Login onLogin={u => { setAuth(u); setAbaAtiva('pedidos') }} />

  const isAdmin = auth.nivel === 'admin'

  // Abas disponíveis por nível
  const abas = [
    { id: 'pedidos',   label: '📋 Pedidos',   todos: true  },
    { id: 'contatos',  label: '👥 Contatos',  todos: false },
    { id: 'cardapio',  label: '🍰 Cardápio',  todos: false },
    { id: 'templates', label: '📝 Templates', todos: false },
    { id: 'disparar',  label: '🚀 Disparar',  todos: false },
    { id: 'bot',       label: '🤖 Bot',       todos: false },
    { id: 'config',    label: '⚙️ Config',    todos: false },
    { id: 'usuarios',  label: '👤 Usuários',  todos: false },
  ].filter(a => isAdmin || a.todos)

  function renderConteudo() {
    if (abaAtiva === 'pedidos')   return <Pedidos   nivel={auth.nivel} token={auth.token} />
    if (!isAdmin) return null
    if (abaAtiva === 'contatos')  return <Contatos  token={auth.token} />
    if (abaAtiva === 'cardapio')  return <Cardapio  token={auth.token} />
    if (abaAtiva === 'templates') return <Templates token={auth.token} />
    if (abaAtiva === 'disparar')  return <Disparar  token={auth.token} />
    if (abaAtiva === 'bot')       return <Bot       token={auth.token} />
    if (abaAtiva === 'config')    return <Config    token={auth.token} />
    if (abaAtiva === 'usuarios')  return <Usuarios  token={auth.token} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: '#1a1a1a', color: 'white', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, height: 52 }}>
        <span style={{ fontSize: 18, marginRight: 6 }}>🍞</span>
        <span style={{ fontWeight: 700, fontSize: 14, marginRight: 20 }}>Padaria da Matriz</span>

        {abas.map(aba => (
          <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
            style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
              background: abaAtiva === aba.id ? '#c8660a' : 'transparent',
              color: abaAtiva === aba.id ? 'white' : 'rgba(255,255,255,0.6)',
              transition: 'all .15s' }}>
            {aba.label}
          </button>
        ))}

        {/* Info usuário + logout */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{auth.nome}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>
              {isAdmin ? 'Administrador' : 'Frente de Caixa'}
            </div>
          </div>
          <button onClick={logout}
            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: 24, background: '#faf7f2', overflowY: 'auto' }}>
        {renderConteudo()}
      </div>
    </div>
  )
}