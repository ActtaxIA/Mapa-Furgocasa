'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  itemName: string
  warningText: string
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  warningText
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (confirmText !== 'ELIMINAR') {
      setError('Debes escribir "ELIMINAR" exactamente (en mayúsculas)')
      return
    }
    onConfirm()
    setConfirmText('')
    setError('')
  }

  const handleClose = () => {
    setConfirmText('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900 font-semibold mb-2">⚠️ Advertencia:</p>
            <p className="text-sm text-yellow-800">{warningText}</p>
          </div>

          <div>
            <p className="text-gray-700 mb-3">
              Vas a eliminar: <strong className="text-red-600">{itemName}</strong>
            </p>
            
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Para confirmar, escribe <span className="text-red-600">ELIMINAR</span> (en mayúsculas):
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value)
                setError('')
              }}
              placeholder="ELIMINAR"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
              autoFocus
            />
            
            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Eliminar Permanentemente
          </button>
        </div>
      </div>
    </div>
  )
}

