'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface Filtros {
  busqueda: string
  pais: string
  comunidad_autonoma: string
  provincia: string
  servicios: string[]
  precio: string
  caracteristicas: string[]
}

interface FiltrosMapaProps {
  filtros: Filtros
  onFiltrosChange: (filtros: Filtros) => void
  onClose?: () => void
  totalResultados: number
  paisesDisponibles: string[]
  comunidadesDisponibles: string[]
  provinciasDisponibles: string[]
}

const SERVICIOS = [
  { id: 'agua', label: '💧 Agua' },
  { id: 'electricidad', label: '⚡ Electricidad' },
  { id: 'vaciado_aguas_negras', label: '♻️ Vaciado Químico' },
  { id: 'vaciado_aguas_grises', label: '🚰 Vaciado Aguas Grises' },
  { id: 'wifi', label: '📶 WiFi' },
  { id: 'duchas', label: '🚿 Duchas' },
  { id: 'wc', label: '🚻 WC' },
  { id: 'lavanderia', label: '🧺 Lavandería' },
  { id: 'restaurante', label: '🍽️ Restaurante' },
  { id: 'supermercado', label: '🛒 Supermercado' },
  { id: 'zona_mascotas', label: '🐕 Zona Mascotas' }
]

const PRECIOS = [
  { value: '', label: 'Todos los precios' },
  { value: 'gratis', label: 'Gratis' },
  { value: 'de-pago', label: 'De pago' },
  { value: 'desconocido', label: 'Precio desconocido' }
]

const CARACTERISTICAS = [
  { id: 'con_descuento_furgocasa', label: '🎫 Con descuento FURGOCASA' },
  { id: 'verificado', label: '✓ Verificado oficialmente' }
]

export function FiltrosMapa({ filtros, onFiltrosChange, onClose, totalResultados, paisesDisponibles, comunidadesDisponibles, provinciasDisponibles }: FiltrosMapaProps) {
  const handleBusquedaChange = (valor: string) => {
    onFiltrosChange({ ...filtros, busqueda: valor })
  }

  const handlePaisChange = (valor: string) => {
    // Al cambiar país, resetear comunidad y provincia
    onFiltrosChange({ 
      ...filtros, 
      pais: valor, 
      comunidad_autonoma: '',
      provincia: '' 
    })
  }

  const handleComunidadChange = (valor: string) => {
    // Al cambiar comunidad, resetear provincia
    onFiltrosChange({ 
      ...filtros, 
      comunidad_autonoma: valor,
      provincia: '' 
    })
  }

  const handleProvinciaChange = (valor: string) => {
    onFiltrosChange({ ...filtros, provincia: valor })
  }

  const handlePrecioChange = (valor: string) => {
    onFiltrosChange({ ...filtros, precio: valor })
  }

  const handleServicioToggle = (servicio: string) => {
    const nuevos = filtros.servicios.includes(servicio)
      ? filtros.servicios.filter(s => s !== servicio)
      : [...filtros.servicios, servicio]
    onFiltrosChange({ ...filtros, servicios: nuevos })
  }

  const handleCaracteristicaToggle = (caracteristica: string) => {
    const nuevas = filtros.caracteristicas.includes(caracteristica)
      ? filtros.caracteristicas.filter(c => c !== caracteristica)
      : [...filtros.caracteristicas, caracteristica]
    onFiltrosChange({ ...filtros, caracteristicas: nuevas })
  }

  const limpiarFiltros = () => {
    onFiltrosChange({
      busqueda: '',
      pais: '',
      comunidad_autonoma: '',
      provincia: '',
      servicios: [],
      precio: '',
      caracteristicas: []
    })
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Azulado */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-200">
        <h2 className="text-lg font-bold text-primary-900">Filtros de Búsqueda</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-primary-100 rounded-full transition-colors"
            aria-label="Cerrar filtros"
          >
            <XMarkIcon className="w-6 h-6 text-primary-700" />
          </button>
        )}
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto px-2 py-0.5 space-y-1">
        {/* Búsqueda */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Buscar dirección o lugar
          </label>
          <div className="relative">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              placeholder="Nombre, ciudad, dirección..."
              className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {filtros.busqueda && (
              <button
                onClick={() => handleBusquedaChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* País */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Seleccione un país primero
          </label>
          <select
            value={filtros.pais || ''}
            onChange={(e) => handlePaisChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="">Todos los países</option>
            {paisesDisponibles.map((pais) => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
        </div>

        {/* Comunidad Autónoma / Región */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Comunidad / Región
          </label>
          <select
            value={filtros.comunidad_autonoma || ''}
            onChange={(e) => handleComunidadChange(e.target.value)}
            disabled={!filtros.pais}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas las regiones</option>
            {comunidadesDisponibles.map(comunidad => (
              <option key={comunidad} value={comunidad}>{comunidad}</option>
            ))}
          </select>
          {!filtros.pais && (
            <p className="text-xs text-gray-500 mt-1">Seleccione un país primero</p>
          )}
        </div>

        {/* Provincia */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Provincia
          </label>
          <select
            value={filtros.provincia || ''}
            onChange={(e) => handleProvinciaChange(e.target.value)}
            disabled={!filtros.comunidad_autonoma}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas las provincias</option>
            {provinciasDisponibles.map(provincia => (
              <option key={provincia} value={provincia}>{provincia}</option>
            ))}
          </select>
          {!filtros.comunidad_autonoma && (
            <p className="text-xs text-gray-500 mt-1">Seleccione una región primero</p>
          )}
        </div>

        {/* Servicios */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Servicios
          </label>
          <div className="space-y-0.5">
            {SERVICIOS.map(servicio => (
              <label key={servicio.id} className="flex items-center cursor-pointer hover:bg-gray-50 py-1 px-1.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={filtros.servicios.includes(servicio.id)}
                  onChange={() => handleServicioToggle(servicio.id)}
                  className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-1 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{servicio.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Precio
          </label>
          <div className="space-y-0.5">
            {PRECIOS.map(precio => (
              <label key={precio.value} className="flex items-center cursor-pointer hover:bg-gray-50 py-1 px-1.5 rounded transition-colors">
                <input
                  type="radio"
                  name="precio"
                  value={precio.value}
                  checked={filtros.precio === precio.value}
                  onChange={(e) => handlePrecioChange(e.target.value)}
                  className="w-3.5 h-3.5 text-primary-600 focus:ring-1 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{precio.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Características */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Características
          </label>
          <div className="space-y-0.5">
            {CARACTERISTICAS.map(caracteristica => (
              <label key={caracteristica.id} className="flex items-center cursor-pointer hover:bg-gray-50 py-1 px-1.5 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={filtros.caracteristicas.includes(caracteristica.id)}
                  onChange={() => handleCaracteristicaToggle(caracteristica.id)}
                  className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-1 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{caracteristica.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="border-t px-3 py-2 space-y-2 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          <span className="font-semibold text-gray-900">{totalResultados}</span> {totalResultados === 1 ? 'área encontrada' : 'áreas encontradas'}
        </div>
        <button
          onClick={limpiarFiltros}
          className="w-full py-1.5 px-3 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100 transition-colors font-medium"
        >
          Restablecer Filtros
        </button>
      </div>
    </div>
  )
}
