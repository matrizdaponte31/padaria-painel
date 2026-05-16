import { useState } from 'react'
import Pedidos   from './Pedidos'
import Contatos  from './Contatos'
import Templates from './Templates'
import Disparar  from './Disparar'
import Bot       from './Bot'
import Config    from './Config'
import Cardapio  from './Cardapio'

function App() {
  const [abaAtiva, setAbaAtiva] = useState('pedidos')

  const abas = [
    { id: 'pedidos',   label: '📋 Pedidos' },
    { id: 'contatos',  label: '👥 Contatos' },
    { id: 'cardapio',  label: '🍰 Cardápio' },
    { id: 'templates', label: '📝 Templates' },
    { id: 'disparar',  label: '🚀 Disparar' },
    { id: 'bot',       label: '🤖 Bot' },
    { id: 'config',    label: '⚙️ Config' },
  ]

  function renderConteudo() {
    if (abaAtiva === 'pedidos')   return <Pedidos />
    if (abaAtiva === 'contatos')  return <Contatos />
    if (abaAtiva === 'cardapio')  return <Cardapio />
    if (abaAtiva === 'templates') return <Templates />
    if (abaAtiva === 'disparar')  return <Disparar />
    if (abaAtiva === 'bot')       return <Bot />
    if (abaAtiva === 'config')    return <Config />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a1a1a', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, height: 56 }}>
        <span style={{ fontSize: 20, marginRight: 8 }}>🍞</span>
        <span style={{ fontWeight: 700, fontSize: 15, marginRight: 24 }}>Padaria da Matriz</span>
        {abas.map(aba => (
          <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: abaAtiva === aba.id ? '#c8660a' : 'transparent', color: abaAtiva === aba.id ? 'white' : 'rgba(255,255,255,0.6)', transition: 'all .15s' }}>
            {aba.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, background: '#faf7f2', overflowY: 'auto' }}>
        {renderConteudo()}
      </div>
    </div>
  )
}

export default App