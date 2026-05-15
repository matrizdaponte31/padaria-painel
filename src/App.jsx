import { useState } from 'react'
import Pedidos   from './Pedidos'
import Contatos  from './Contatos'
import Templates from './Templates'
import Disparar  from './Disparar'
import Bot       from './Bot'
import Config    from './Config'

function App() {
  const [abaAtiva, setAbaAtiva] = useState('pedidos')

  const abas = [
    { id: 'pedidos',   label: '📋 Pedidos' },
    { id: 'contatos',  label: '👥 Contatos' },
    { id: 'templates', label: '📝 Templates' },
    { id: 'disparar',  label: '🚀 Disparar' },
    { id: 'bot',       label: '🤖 Bot' },
    { id: 'config',    label: '⚙️ Config' },
  ]

  function renderConteudo() {
    if (abaAtiva === 'pedidos')   return <Pedidos />
    if (abaAtiva === 'contatos')  return <Contatos />
    if (abaAtiva === 'templates') return <Templates />
    if (abaAtiva === 'disparar')  return <Disparar />
    if (abaAtiva === 'bot')       return <Bot />
    if (abaAtiva === 'config')    return <Config />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: 200, background: '#1a1a1a', color: 'white', padding: 20, flexShrink: 0 }}>
        <h2 style={{ fontSize: 16, marginBottom: 24 }}>🍞 Padaria da Matriz</h2>
        {abas.map(aba => (
          <div key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            style={{
              padding: '10px 12px',
              marginBottom: 4,
              borderRadius: 6,
              cursor: 'pointer',
              background: abaAtiva === aba.id ? '#c8660a' : 'transparent',
            }}>
            {aba.label}
          </div>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: 32, background: '#faf7f2', overflowY: 'auto' }}>
        {renderConteudo()}
      </div>

    </div>
  )
}

export default App