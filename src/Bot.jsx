import { useState, useEffect } from 'react'
import { api } from './api'

const INFO = {
  boas_vindas:       { label: '👋 Boas-vindas',      desc: 'Primeira mensagem ao cliente (quando IA está desligada)' },
  pedido_confirmado: { label: '✅ Pedido confirmado', desc: 'Enviada quando pedido é confirmado' },
  pedido_cancelado:  { label: '❌ Pedido cancelado',  desc: 'Enviada quando cliente cancela' },
  aviso_pronto:      { label: '🛍️ Pedido pronto',    desc: 'Enviada pelo painel quando pronto' },
}

export default function Bot() {
  const [mensagens, setMensagens]     = useState({})
  const [iaAtiva, setIaAtiva]         = useState(true)
  const [treinamento, setTreinamento] = useState('')
  const [loading, setLoading]         = useState(true)
  const [salvando, setSalvando]       = useState({})
  const [salvo, setSalvo]             = useState({})
  const [salvandoIA, setSalvandoIA]   = useState(false)
  const [salvoIA, setSalvoIA]         = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/mensagens'),
      api.get('/api/ia')
    ]).then(([msgs, ia]) => {
      const obj = {}
      ;(msgs || []).forEach(m => { obj[m.chave] = m.texto })
      setMensagens(obj)
      setIaAtiva(ia.ia_ativa !== false)
      setTreinamento(ia.treinamento || '')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function salvarMensagem(chave) {
    setSalvando(s => ({ ...s, [chave]: true }))
    try {
      await api.put(`/api/mensagens/${chave}`, { texto: mensagens[chave] })
      setSalvo(s => ({ ...s, [chave]: true }))
      setTimeout(() => setSalvo(s => ({ ...s, [chave]: false })), 2000)
    } catch (e) { alert(e.message) }
    setSalvando(s => ({ ...s, [chave]: false }))
  }

  async function salvarIA() {
    setSalvandoIA(true)
    try {
      await api.put('/api/ia', { ia_ativa: iaAtiva, treinamento })
      setSalvoIA(true)
      setTimeout(() => setSalvoIA(false), 2000)
    } catch (e) { alert(e.message) }
    setSalvandoIA(false)
  }

  if (loading) return <p style={{ padding: 32 }}>Carregando...</p>

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>🤖 Configurar Rafael</h2>

      {/* Card IA */}
      <div style={{ background: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>🧠 Inteligência Artificial (Groq)</h3>
            <p style={{ fontSize: 13, color: '#888' }}>
              Quando ligada, o Rafael entende mensagens livres e responde naturalmente. Quando desligada, usa o fluxo clássico com números.
            </p>
          </div>

          {/* Toggle */}
          <div
            onClick={() => setIaAtiva(v => !v)}
            style={{
              width: 52, height: 28, borderRadius: 99, cursor: 'pointer',
              background: iaAtiva ? '#c8660a' : '#ccc',
              position: 'relative', transition: 'background .2s', flexShrink: 0
            }}>
            <div style={{
              position: 'absolute', top: 3,
              left: iaAtiva ? 26 : 3,
              width: 22, height: 22, borderRadius: '50%',
              background: 'white', transition: 'left .2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: iaAtiva ? '#c8660a' : '#999', width: 60 }}>
            {iaAtiva ? 'Ligada' : 'Desligada'}
          </span>
        </div>

        {/* Campo de treinamento */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>
            📚 Instruções de treinamento
          </label>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
            Escreva aqui como o Rafael deve se comportar. Ex: "Sempre use emojis. Se perguntarem sobre encomendas especiais, diga que o prazo é de 3 dias. Nunca ofereça desconto."
          </p>
          <textarea
            value={treinamento}
            onChange={e => setTreinamento(e.target.value)}
            rows={6}
            placeholder={`Exemplos de instruções:\n- Sempre seja simpático e use emojis com moderação\n- Se perguntarem sobre encomendas especiais, diga que o prazo é de 3 dias úteis\n- Nunca ofereça desconto sem autorização\n- Se o cliente reclamar de algo, peça desculpas e anote o problema`}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={salvarIA} disabled={salvandoIA}
            style={{ padding: '9px 20px', borderRadius: 6, border: 'none', background: salvoIA ? '#28a745' : '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'background .3s' }}>
            {salvandoIA ? 'Salvando...' : salvoIA ? '✓ Salvo!' : '💾 Salvar configurações da IA'}
          </button>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            Modelo: llama-3.3-70b-versatile (Groq)
          </div>
        </div>
      </div>

      {/* Mensagens do bot */}
      <h3 style={{ marginBottom: 16, fontSize: 15, color: '#555' }}>
        💬 Mensagens automáticas
        <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 8, color: '#aaa' }}>
          (usadas quando a IA está desligada ou para confirmações)
        </span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {Object.entries(INFO).map(([chave, info]) => (
          <div key={chave} style={{ background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: 4, fontSize: 15 }}>{info.label}</h3>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>{info.desc}</p>
            <textarea
              value={mensagens[chave] || ''}
              onChange={e => setMensagens(m => ({ ...m, [chave]: e.target.value }))}
              rows={5}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', resize: 'vertical', fontSize: 13, lineHeight: 1.5, boxSizing: 'border-box' }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['{nome}', '{pedido}', '{total}', '{retirada}'].map(v => (
                <button key={v}
                  onClick={() => setMensagens(m => ({ ...m, [chave]: (m[chave] || '') + v }))}
                  style={{ padding: '2px 8px', fontSize: 11, borderRadius: 4, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}>
                  {v}
                </button>
              ))}
              <button onClick={() => salvarMensagem(chave)} disabled={salvando[chave]}
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