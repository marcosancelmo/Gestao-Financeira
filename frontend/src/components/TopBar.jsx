import React from 'react'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-border bg-panel/60 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="font-display text-lg font-semibold leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center">
            <User size={15} className="text-secondary" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-medium">{user?.nome}</div>
            <div className="text-[11px] text-muted capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-md text-secondary hover:bg-elevated hover:text-negative transition-colors"
          title="Sair"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
