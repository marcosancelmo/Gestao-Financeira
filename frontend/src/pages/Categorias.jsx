import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import Modal from '../components/Modal.jsx'
import api from '../services/api.js'

export default function Categorias() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm({ defaultValues: { tipo: 'entrada' } })

  const entradas = useQuery({
    queryKey: ['categorias', 'entrada'],
    queryFn: async () => (await api.get('/categorias/', { params: { tipo: 'entrada' } })).data,
  })
  const saidas = useQuery({
    queryKey: ['categorias', 'saida'],
    queryFn: async () => (await api.get('/categorias/', { params: { tipo: 'saida' } })).data,
  })

  async function onSubmit(values) {
    await api.post('/categorias/', values)
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    setModalOpen(false)
    reset({ tipo: 'entrada' })
  }

  async function excluir(cat) {
    if (!confirm(`Remover a categoria "${cat.nome}"?`)) return
    await api.delete(`/categorias/${cat.id}`)
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
  }

  return (
    <div>
      <TopBar title="Categorias" subtitle="Classificações de entradas e saídas" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Nova Categoria
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoriaLista titulo="Entradas" tone="positive" categorias={entradas.data} onDelete={excluir} />
          <CategoriaLista titulo="Saídas" tone="negative" categorias={saidas.data} onDelete={excluir} />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Categoria">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Nome</label>
            <input {...register('nome', { required: true })} className="input" placeholder="Ex: Compra de Solda Especial" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Tipo</label>
            <select {...register('tipo')} className="input">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  )
}

function CategoriaLista({ titulo, tone, categorias, onDelete }) {
  return (
    <div className="bg-panel border border-border rounded-lg p-4">
      <h3 className={`font-display text-sm font-semibold mb-3 ${tone === 'positive' ? 'text-positive' : 'text-negative'}`}>{titulo}</h3>
      <ul className="space-y-1">
        {(categorias || []).map((c) => (
          <li key={c.id} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${c.destaque ? 'bg-destaque/10 text-destaque font-medium' : 'hover:bg-elevated'}`}>
            <span>{c.nome}</span>
            <button onClick={() => onDelete(c)} className="text-muted hover:text-negative">
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
