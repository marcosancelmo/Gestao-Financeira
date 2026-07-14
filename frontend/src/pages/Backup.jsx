import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DatabaseBackup, Download, RotateCcw } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import api from '../services/api.js'

export default function Backup() {
  const queryClient = useQueryClient()
  const backups = useQuery({ queryKey: ['backups'], queryFn: async () => (await api.get('/backup/')).data })

  async function gerarBackup() {
    await api.post('/backup/gerar')
    queryClient.invalidateQueries({ queryKey: ['backups'] })
  }

  async function baixar(row) {
    const response = await api.get(`/backup/${row.id}/download`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', row.nome_arquivo)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async function restaurar(row) {
    if (!confirm(`Restaurar o backup "${row.nome_arquivo}"? Isso substituirá o banco de dados atual.`)) return
    const { data } = await api.post(`/backup/${row.id}/restaurar`)
    alert(data.mensagem)
  }

  return (
    <div>
      <TopBar title="Backup" subtitle="Backup manual e restauração do banco SQLite" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={gerarBackup} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <DatabaseBackup size={15} /> Realizar Backup
          </button>
        </div>

        <div className="bg-panel border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-elevated/50 text-left text-muted uppercase text-[11px] tracking-wide">
                <th className="px-4 py-3 font-medium">Arquivo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {(backups.data || []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted">Nenhum backup realizado ainda.</td></tr>
              )}
              {(backups.data || []).map((row) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-elevated/40">
                  <td className="px-4 py-3">{row.nome_arquivo}</td>
                  <td className="px-4 py-3 capitalize">{row.tipo}</td>
                  <td className="px-4 py-3">{new Date(row.criado_em).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => baixar(row)} className="p-1.5 rounded text-secondary hover:text-accent hover:bg-accent-soft/15" title="Baixar">
                        <Download size={14} />
                      </button>
                      <button onClick={() => restaurar(row)} className="p-1.5 rounded text-secondary hover:text-negative hover:bg-negative-soft/15" title="Restaurar">
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
