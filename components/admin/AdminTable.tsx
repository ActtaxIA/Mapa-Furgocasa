'use client'

import { useState, useMemo } from 'react'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export interface AdminTableColumn<T> {
  key: string
  title: string
  sortable?: boolean
  searchable?: boolean
  render?: (item: T) => React.ReactNode
  exportValue?: (item: T) => string | number
}

interface AdminTableProps<T> {
  data: T[]
  columns: AdminTableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  searchPlaceholder?: string
  exportFilename?: string
  className?: string
}

export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  searchPlaceholder = 'Buscar en todos los campos...',
  exportFilename = 'datos',
  className = ''
}: AdminTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    const searchLower = searchTerm.toLowerCase()
    return data.filter(item => {
      return columns.some(col => {
        if (col.searchable === false) return false
        const value = item[col.key]
        if (value == null) return false
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [data, searchTerm, columns])

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue == null) return 1
      if (bValue == null) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.toLowerCase().localeCompare(bValue.toLowerCase())
      }

      if (aValue < bValue) return -1
      if (aValue > bValue) return 1
      return 0
    })

    return sortDirection === 'desc' ? sorted.reverse() : sorted
  }, [filteredData, sortColumn, sortDirection])

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    if (itemsPerPage === -1) return sortedData // Mostrar todos
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  // Resetear a página 1 cuando cambian filtros u ordenación
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column || column.sortable === false) return

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = columns.map(col => col.title).join(',')
    const rows = sortedData.map(item => {
      return columns
        .map(col => {
          const value = col.exportValue
            ? col.exportValue(item)
            : item[col.key]
          
          // Escapar comillas y comas
          const stringValue = String(value ?? '')
          return `"${stringValue.replace(/"/g, '""')}"`
        })
        .join(',')
    })

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Exportar a Excel (formato CSV pero con extensión .xls para que Excel lo abra)
  const exportToExcel = () => {
    const headers = columns.map(col => col.title).join('\t')
    const rows = sortedData.map(item => {
      return columns
        .map(col => {
          const value = col.exportValue
            ? col.exportValue(item)
            : item[col.key]
          return String(value ?? '')
        })
        .join('\t')
    })

    const tsv = [headers, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${exportFilename}_${new Date().toISOString().split('T')[0]}.xls`
    link.click()
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Barra de búsqueda y exportación */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              title="Exportar a CSV"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              title="Exportar a Excel"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable !== false && sortColumn === column.key && (
                      <span className="text-sky-600">
                        {sortDirection === 'asc' ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(item) : (
                        <span className="text-sm text-gray-900">{String(item[column.key] ?? '')}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filteredData.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Mostrar</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Todos</option>
            </select>
            <span className="text-sm text-gray-700">por página</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {itemsPerPage === -1 ? (
                `Mostrando ${sortedData.length} de ${sortedData.length} resultados`
              ) : (
                `Mostrando ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, sortedData.length)} de ${sortedData.length} resultados`
              )}
            </span>
            
            {itemsPerPage !== -1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <div className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg">
                  Página {currentPage} de {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página siguiente"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

