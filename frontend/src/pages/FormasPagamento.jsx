import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import Modal from '../components/Modal.jsx'
import api from '../services/api.js'

export default function FormasPagamento() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const formas = useQuery({ queryKey: ['formas-pagamento'], queryFn: async () => (await api.get('/formas-pagamento/')).data })

  async function onSubmit(values) {
    await api.post('/formas-pagamento/', values)
    queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] })
    setModalOpen(false)
    reset()
  }

  async function excluir(f) {
    if (!confirm(`Remover a forma de pagamento "${f.nome}"?`)) return
    await api.delete(`/formas-pagamento/${f.id}`)
    queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] })
  }

  return (
    <div>
      <TopBar title="Forma de Pagamento" subtitle="Meios de pagamento utilizados nos lançamentos" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Nova Forma de Pagamento
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(formas.data || []).map((f) => (
            <div key={f.id} className="bg-panel border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-accent" />
                <span className="text-sm">{f.nome}</span>
              </div>
              <button onClick={() => excluir(f)} className="text-muted hover:text-negative">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Forma de Pagamento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Nome</label>
            <input {...register('nome', { required: true })} className="input" placeholder="Ex: Vale Alimentação" />
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  )
}
