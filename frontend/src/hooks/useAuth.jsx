import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rm_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (username, senha) => {
    const { data } = await api.post('/auth/login', { username, senha })
    localStorage.setItem('rm_token', data.access_token)
    localStorage.setItem('rm_user', JSON.stringify(data.usuario))
    setUser(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('rm_token')
    localStorage.removeItem('rm_user')
    setUser(null)
  }, [])

  const isSupervisor = user?.role === 'supervisor'

  return (
    <AuthContext.Provider value={{ user, login, logout, isSupervisor }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
