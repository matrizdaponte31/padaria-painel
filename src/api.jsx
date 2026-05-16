const BASE = 'https://bakery-production-ea1e.up.railway.app'

function getToken() {
  return localStorage.getItem('token') || ''
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const r = await fetch(BASE + path, opts)
  if (r.status === 401) {
    localStorage.clear()
    window.location.reload()
    return
  }
  const data = await r.json()
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

export const api = {
  get:    (path)        => req('GET',    path),
  post:   (path, body)  => req('POST',   path, body),
  put:    (path, body)  => req('PUT',    path, body),
  delete: (path)        => req('DELETE', path),
}