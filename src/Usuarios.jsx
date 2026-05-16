import { useState, useEffect } from 'react'

const API = 'https://bakery-production-ea1e.up.railway.app'

function ModalUsuario({ usuario, token, onClose, onSalvo }) {
  const isEdit = !!usuario
  const [form, setForm] = useState({
    nome:    usuario?.nome    || '',
    usuario: usuario?.usuario || '',
    senha:   '',
    nivel:   usuario?.nivel   || 'caixa',
    ativo:   usuario?.ativo   !== false,
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function salvar() {
    if (!form.nome || !form.usuario) { setErro('Nome e usuário são obrigatórios'); return }
    if (!isEdit && !form.senha) { setErro('Senha é obrigatória para novo usuário'); return }
    setSalvando(true)
    setErro('')
    try {
      const url = isEdit ? `${API}/api/usuarios/${usuario.id}` : `${API}/api/usuarios`
      const method = isEdit ? 'PUT' : 'POST'
      const body = { ...form }
      if (isEdit && !form.senha) delete body.senha
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await r.json()
      if (!r.ok) { setErro(data.error || 'Erro ao salvar'); return }
      onSalvo(); onClose()
    } catch { setErro('Erro ao conectar com o servidor') }
    setSalvando(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 10, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: 20 }}>{isEdit ? '✏️ Editar Usuário' : '➕ Novo Usuário'}</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Nome completo *</label>
          <input value={form.nome} onChange={set('nome')} placeholder="Maria da Silva"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Usuário (login) *</label>
          <input value={form.usuario} onChange={set('usuario')} placeholder="maria.silva"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>
            Senha {isEdit && <span style={{ color: '#aaa', fontWeight: 400 }}>(deixe em branco para não alterar)</span>}
          </label>
          <input type="password" value={form.senha} onChange={set('senha')} placeholder="••••••••"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#555' }}>Nível de acesso *</label>
          <select value={form.nivel} onChange={set('nivel')}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}>
            <option value="admin">Administrador — acesso total</option>
            <option value="caixa">Frente de Caixa — pedidos apenas</option>
          </select>
        </div>

        {isEdit && (
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="ativo" checked={form.ativo}
              onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} />
            <label htmlFor="ativo" style={{ fontSize: 13, color: '#555' }}>Usuário ativo</label>
          </div>
        )}

        {erro && (
          <div style={{ background: '#fde8e8', color: '#b83232', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={salvar} disabled={salvando}
            style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            {salvando ? 'Salvando...' : '💾 Salvar'}
          </button>
          <button onClick={onClose}
            style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Usuarios({ token }) {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)

  function carregar() {
    setLoading(true)
    fetch(`${API}/api/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setUsuarios(d || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id, nome) {
    if (!confirm(`Excluir usuário "${nome}"?`)) return
    try {
      const r = await fetch(`${API}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await r.json()
      if (!r.ok) { alert(data.error); return }
      carregar()
    } catch { alert('Erro ao excluir') }
  }

  const nivelLabel = { admin: '👑 Administrador', caixa: '🧾 Frente de Caixa' }
  const nivelCor   = { admin: { background: '#fff3cd', color: '#856404' }, caixa: { background: '#d4edda', color: '#155724' } }

  if (loading) return <p style={{ padding: 32 }}>Carregando usuários...</p>

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2>👤 Usuários</h2>
        <button onClick={() => setModal('novo')}
          style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: '#c8660a', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
          ➕ Novo Usuário
        </button>
        <button onClick={carregar}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      <div style={{ background: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: '#c8660a' }}>
        💡 O usuário padrão é <b>admin</b> com senha <b>padaria123</b>. Troque a senha após o primeiro acesso!
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {usuarios.map(u => (
          <div key={u.id} style={{ background: 'white', borderRadius: 8, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 14, opacity: u.ativo ? 1 : .5 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {u.nivel === 'admin' ? '👑' : '🧾'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{u.nome}</div>
              <div style={{ fontSize: 12.5, color: '#888', marginTop: 2 }}>
                @{u.usuario}
                {!u.ativo && <span style={{ marginLeft: 8, color: '#dc3545' }}>• Inativo</span>}
              </div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, ...nivelCor[u.nivel] }}>
              {nivelLabel[u.nivel]}
            </span>
            <div style={{ fontSize: 12, color: '#aaa', textAlign: 'right', minWidth: 100 }}>
              {u.ultimo_acesso
                ? `Último acesso\n${new Date(u.ultimo_acesso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                : 'Nunca acessou'}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setModal(u)} title="Editar"
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>✏️</button>
              <button onClick={() => excluir(u.id, u.nome)} title="Excluir"
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <ModalUsuario
          usuario={modal === 'novo' ? null : modal}
          token={token}
          onClose={() => setModal(null)}
          onSalvo={carregar}
        />
      )}
    </div>
  )
}