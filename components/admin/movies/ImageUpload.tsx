'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Copy } from 'lucide-react'

interface ImageUploadProps {
  label: string
  bucket: string
  folder: string
  value: string
  onChange: (url: string) => void
  aspect?: 'square' | 'video' | 'poster'
  allowCopyFrom?: string
  onCopyFrom?: () => void
  copyLabel?: string
}

export function ImageUpload({ 
  label, bucket, folder, value, onChange, aspect = 'square',
  allowCopyFrom, onCopyFrom, copyLabel
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      // 1. Subir nueva imagen
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const oldUrl = value

      // 2. Actualizar con nueva URL
      onChange(data.url)

      // 3. Eliminar imagen vieja
      if (oldUrl && oldUrl !== data.url && oldUrl.includes(bucket)) {
        console.log('🗑️ Eliminando imagen vieja:', oldUrl)
        try {
          const deleteResponse = await fetch('/api/admin/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: oldUrl, bucket })
          })
          const deleteData = await deleteResponse.json()
          if (deleteData.error) {
            console.warn('⚠️ No se pudo eliminar:', deleteData.error)
          } else {
            console.log('✅ Imagen vieja eliminada')
          }
        } catch (deleteErr) {
          console.warn('⚠️ Error al eliminar:', deleteErr)
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error al subir la imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!value) return
    setDeleting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value, bucket })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      onChange('')
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la imagen')
    } finally {
      setDeleting(false)
    }
  }

  // Ancho y alto fijo según aspect
  const sizeClass = {
    square: 'w-full h-auto min-h-[150px] max-w-[200px]',
    video: 'w-full h-auto min-h-[100px] max-w-[250px]',
    poster: 'w-full h-auto min-h-[200px] max-w-[150px]'
  }[aspect]

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />

      {allowCopyFrom && onCopyFrom && (
        <button
          onClick={onCopyFrom}
          className="mb-1.5 flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
        >
          <Copy className="h-3 w-3" />
          {copyLabel || 'Usar misma imagen'}
        </button>
      )}

      {value ? (
        <div className={`relative ${sizeClass} rounded-xl overflow-hidden border border-gray-700 bg-gray-800/50 group mx-auto`}>
          <div className="aspect-square w-full">
            <img
              src={value}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-7 px-2.5 border border-white/30 text-white hover:bg-white/10 rounded-lg text-xs flex items-center gap-1"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Cambiar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-7 w-7 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${sizeClass} rounded-xl border-2 border-dashed border-gray-700 hover:border-red-500/50 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors bg-gray-800/30 mx-auto`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
          ) : (
            <>
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">Subir imagen</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  )
}