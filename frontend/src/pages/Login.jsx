import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Flame, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, senha)
      const dest = location.state?.from?.pathname || '/'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Usuário ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 font-body text-primary">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-accent-soft/15 flex items-center justify-center mb-3">
            <Flame size={22} className="text-accent" />
          </div>
          <h1 className="font-display text-xl font-semibold">RM Serralheria</h1>
          <p className="text-sm text-muted mt-1">Controle Financeiro</p>
        </div>

        <form onSubmit={handleSubmit} className="bracket-frame bg-panel border border-border rounded-lg p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Usuário</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="ronaldo ou felipe"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-sm text-negative bg-negative-soft/15 border border-negative/30 rounded-md px-3 py-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          >
            <LogIn size={15} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
