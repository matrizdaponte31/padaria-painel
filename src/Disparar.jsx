import { useState, useEffect, useRef } from 'react'
import { api } from './api'

export default function Disparar() {
  const [contatos, setContatos]   = useState([])
  const [templates, setTemplates] = useState([])
  const [grupo, setGrupo]         = useState('')
  const [mensagem, setMensagem]   = useState('')
  const [delay, setDelay]         = useState(2)
  const [enviando, setEnviando]   = useState(false)
  const [log, setLog]             = useState([])
  const [progresso, setProgresso] = useState({ feito: 0, total: 0 })
  const parar = useRef(false)

  useEffect(() => {
    api.get('/api/contatos').then(d => setContatos(d || [])).catch(() => {})
    api.get('/api/templates').then(d => setTemplates(d || [])).catch(() => {})
  }, [])

  const grupos = [...new Set(contatos.map(c => c.grupo).filter(Boolean))]
  const destinatarios = contatos.filter(c => !grupo || c.grupo === grupo)

  function addLog(msg, tipo = 'info') {
    setLog(l => [{ msg, tipo, hora: new Date().toLocaleTimeString('pt-BR') }, ...l])
  }

  async function enviar() {
    if (!mensagem.trim()) { alert('Escreva uma mensagem'); return }
    if (destinatarios.length === 0) { alert('Nenhum destinatário'); return }
    if (!confirm(`Enviar para ${destinatarios.length} contatos?`)) return

    parar.current = false
    setEnviando(true)
    setLog([])
    setProgresso({ feito: 0, total: destinatarios.length })
    addLog(`Iniciando envio para ${destinatarios.length} contatos...`)

    for (let i = 0; i < destinatarios.length; i++) {
      if (parar.current) { addLog('⛔ Envio parado!', 'erro'); break }
      const c = destinatarios[i]
      const msg = mensagem.replace(/{nome}/g, c.nome || '')
      try {
        await api.post('/api/disparar', { contatos: [c.telefone], mensagem: msg, delay: 0 })
        addLog(`✓ ${c.nome}`, 'ok')
      } catch (e) {
        addLog(`✕ ${c.nome} — ${e.message}`, 'erro')
      }
      setProgresso(p => ({ ...p, feito: p.feito + 1 }))
      if (i < destinatarios.length - 1 && !parar.current) {
        addLog(`⏳ Aguardando ${delay} min...`)
        await new Promise(res => setTimeout(res, delay * 60 * 1000))
      }
    }

    if (!parar.current) addLog('🎉 Concluído!', 'ok')
    setEnviando(false)
  }

  const pct = progresso.total > 0 ? Math.round((progresso.feito / progresso.total) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Esquerda */}
      <div>
        <h2 style={{ marginBottom: 20 }}>🚀 Disparar Mensagens</h2>

        <div style={{ background: 'white', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 12 }}>🎯 Destinatários</h3>
          <select value={grupo} onChange={e => setGrupo(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 8 }}>
            <option value="">Todos ({contatos.length})</option>
            {grupos.map(g => (
              <option key={g} value={g}>{g} ({contatos.filter(c => c.grupo === g).length})</option>
            ))}
          </select>
          <p style={{ fontSize: 13, color: '#888' }}>{destinatarios.length} contato(s) selecionado(s)</p>
        </div>

        <div style={{ background: 'white', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 12 }}>✉️ Mensagem</h3>
          <select onChange={e => { const t = templates.find(t => String(t.id) === e.target.value); if (t) setMensagem(t.msg) }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', marginBottom: 10 }}>
            <option value="">— Usar template —</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <textarea value={mensagem} onChange={e => setMensagem(e.target.value)}
            placeholder="Olá {nome}! Temos novidades esta semana 🍞"
            rows={5}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 13 }}>Delay entre envios: <b>{delay} min</b></label>
            <input type="range" min={1} max={5} value={delay} onChange={e => setDelay(Number(e.target.value))}
              style={{ width: '100%', marginTop: 4 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={enviar} disabled={enviando}
            style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: enviando ? '#ccc' : '#c8660a', color: 'white', cursor: enviando ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {enviando ? `Enviando... ${progresso.feito}/${progresso.total}` : `🚀 Enviar para ${destinatarios.length} contatos`}
          </button>
          {enviando && (
            <button onClick={() => { parar.current = true }}
              style={{ padding: '10px 16px', borderRadius: 6, border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer' }}>
              ⛔ Parar
            </button>
          )}
        </div>
      </div>

      {/* Direita — Log */}
      <div>
        <h2 style={{ marginBottom: 20 }}>📊 Progresso</h2>
        {progresso.total > 0 && (
          <div style={{ background: '#eee', borderRadius: 99, height: 8, marginBottom: 16 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#c8660a', borderRadius: 99, transition: 'width .3s' }} />
          </div>
        )}
        <div style={{
          background: '#1a1a1a', color: '#e8dfd0', fontFamily: 'monospace', fontSize: 12.5,
          borderRadius: 8, padding: 16, height: 420, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 3
        }}>
          {log.length === 0 && <span style={{ color: '#555' }}>Aguardando início...</span>}
          {log.map((l, i) => (
            <div key={i} style={{ color: l.tipo === 'ok' ? '#7fd99e' : l.tipo === 'erro' ? '#f09090' : '#e8dfd0' }}>
              <span style={{ opacity: .4 }}>[{l.hora}]</span> {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}