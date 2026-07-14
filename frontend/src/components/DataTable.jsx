import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'

/**
 * columns: [{ key, label, render?(row) }]
 */
export default function DataTable({ columns, rows, onEdit, onDelete, emptyLabel = 'Nenhum registro encontrado.' }) {
  return (
    <div className="bg-panel border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-elevated/50 text-left text-muted uppercase text-[11px] tracking-wide">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 w-20"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className={`border-b border-border/60 last:border-0 hover:bg-elevated/40 transition-colors ${row.destaque ? 'bg-destaque/10' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.mono ? 'font-mono' : ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="p-1.5 rounded text-secondary hover:text-accent hover:bg-accent-soft/15">
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} className="p-1.5 rounded text-secondary hover:text-negative hover:bg-negative-soft/15">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
