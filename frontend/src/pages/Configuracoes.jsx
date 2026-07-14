import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Save, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import api from '../services/api.js'

export default function Configuracoes() {
  const queryClient = useQueryClient()
  const [salvo, setSalvo] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const config = useQuery({ queryKey: ['configuracoes'], queryFn: async () => (await api.get('/configuracoes/')).data })

  useEffect(() => {
    if (config.data) reset(config.data)
  }, [config.data])

  async function onSubmit(values) {
    await api.put('/configuracoes/', values)
    queryClient.invalidateQueries({ queryKey: ['configuracoes'] })
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  return (
    <div>
      <TopBar title="Configurações" subtitle="Dados da empresa e preferências do sistema" />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-panel border border-border rounded-lg p-6 space-y-4">
          <F label="Nome da Empresa"><input {...register('nome_empresa')} className="input" /></F>
          <F label="Endereço"><input {...register('endereco')} className="input" /></F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Telefone"><input {...register('telefone')} className="input" /></F>
            <F label="E-mail"><input {...register('email')} className="input" /></F>
          </div>
          <F label="CNPJ"><input {...register('cnpj')} className="input" /></F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Tema">
              <select {...register('tema')} className="input">
                <option value="escuro">Escuro</option>
                <option value="claro">Claro (em breve)</option>
              </select>
            </F>
            <F label="Cor Principal"><input type="color" {...register('cor_principal')} className="input h-10 p-1" /></F>
          </div>
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input type="checkbox" {...register('backup_automatico')} className="accent-accent" />
            Ativar backup automático
          </label>

          {salvo && (
            <div className="text-sm text-positive bg-positive-soft/15 border border-positive/30 rounded-md px-3 py-2 flex items-center gap-2">
              <CheckCircle2 size={15} /> Configurações salvas!
            </div>
          )}

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium">
            <Save size={15} /> Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  )
}

function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}
