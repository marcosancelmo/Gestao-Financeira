import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../services/api.js'

export default function Usuarios() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const usuarios = useQuery({ queryKey: ['usuarios'], queryFn: async () => (await api.get('/usuarios/')).data })

  function abrirNovo() {
    setEditing(null)
    reset({ nome: '', username: '', role: 'colaborador', senha: '' })
    setModalOpen(true)
  }

  function abrirEdicao(row) {
    setEditing(row)
    reset({ nome: row.nome, role: row.role, senha: '' })
    setModalOpen(true)
  }

  async function onSubmit(values) {
    if (editing) {
      const payload = { nome: values.nome, role: values.role }
      if (values.senha) payload.senha = values.senha
      await api.put(`/usuarios/${editing.id}`, payload)
    } else {
      await api.post('/usuarios/', values)
    }
    queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    setModalOpen(false)
  }

  async function desativar(row) {
    if (!confirm(`Desativar o usuário "${row.nome}"?`)) return
    await api.delete(`/usuarios/${row.id}`)
    queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'username', label: 'Usuário' },
    { key: 'role', label: 'Papel', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'ativo', label: 'Status', render: (r) => (
      <span className={r.ativo ? 'text-positive' : 'text-negative'}>{r.ativo ? 'Ativo' : 'Inativo'}</span>
    ) },
  ]

  return (
    <div>
      <TopBar title="Usuários" subtitle="Supervisor (Ronaldo) e Colaborador (Felipe)" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={abrirNovo} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Novo Usuário
          </button>
        </div>
        <DataTable columns={columns} rows={usuarios.data || []} onEdit={abrirEdicao} onDelete={desativar} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Nome"><input {...register('nome', { required: true })} className="input" /></F>
          {!editing && (
            <F label="Usuário (login)"><input {...register('username', { required: true })} className="input" /></F>
          )}
          <F label="Papel">
            <select {...register('role')} className="input">
              <option value="supervisor">Supervisor</option>
              <option value="colaborador">Colaborador</option>
            </select>
          </F>
          <F label={editing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}>
            <input type="password" {...register('senha', { required: !editing })} className="input" />
          </F>
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium">
            Salvar
          </button>
        </form>
      </Modal>
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
