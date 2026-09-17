'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/movies/ImageUpload'
import { LanguageSelect } from '@/components/admin/movies/LanguageSelect'
import { StatusSwitch } from '@/components/admin/movies/StatusSwitch'
import { DurationInput } from '@/components/admin/movies/DurationInput'

export default function EditMoviePage() {
  const router = useRouter()
  const params = useParams()
  const movieId = params?.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    poster_url: '',
    backdrop_url: '',
    promo_desktop_url: '',
    promo_mobile_url: '',
    duration: 0,
    synopsis: '',
    director: '',
    movie_cast: '',
    genre: '',
    rating: 0,
    classification: 'TE',
    language: 'Español Latino',
    release_date: '',
    is_active: true,
    is_coming_soon: false,
    trailer_url: ''
  })

  useEffect(() => {
    const loadMovie = async () => {
      if (!movieId) return
      const { data, error } = await supabase.from('movies').select('*').eq('id', movieId).single()
      if (error) { console.error(error); setLoading(false); return }
      setForm({
        title: data.title || '',
        poster_url: data.poster_url || '',
        backdrop_url: data.backdrop_url || '',
        promo_desktop_url: data.promo_desktop_url || '',
        promo_mobile_url: data.promo_mobile_url || '',
        duration: data.duration || 0,
        synopsis: data.synopsis || '',
        director: data.director || '',
        movie_cast: data.movie_cast?.join(', ') || '',
        genre: data.genre?.join(', ') || '',
        rating: data.rating || 0,
        classification: data.classification || 'TE',
        language: data.language || 'Español Latino',
        release_date: data.release_date || '',
        is_active: data.is_active ?? true,
        is_coming_soon: data.is_coming_soon ?? false,
        trailer_url: data.trailer_url || ''
      })
      setLoading(false)
    }
    loadMovie()
  }, [movieId, supabase])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    
    console.log('📝 Guardando película...')
    console.log('Form actual:', form)
    console.log('poster_url:', form.poster_url)
    console.log('backdrop_url:', form.backdrop_url)

    try {
      const updateData = {
        title: form.title,
        poster_url: form.poster_url,
        backdrop_url: form.backdrop_url,
        promo_desktop_url: form.promo_desktop_url,
        promo_mobile_url: form.promo_mobile_url,
        duration: form.duration,
        synopsis: form.synopsis,
        director: form.director,
        movie_cast: form.movie_cast.split(',').map(s => s.trim()).filter(Boolean),
        genre: form.genre.split(',').map(s => s.trim()).filter(Boolean),
        rating: form.rating,
        classification: form.classification,
        language: form.language,
        release_date: form.release_date,
        is_active: form.is_active,
        is_coming_soon: form.is_coming_soon,
        trailer_url: form.trailer_url,
        updated_at: new Date().toISOString()
      }

      console.log('Update data:', updateData)

      const { data, error } = await supabase
        .from('movies')
        .update(updateData)
        .eq('id', movieId)
        .select()

      if (error) {
        console.error('❌ Error al actualizar:', error)
        throw error
      }

      console.log('✅ Película actualizada:', data)

      router.push('/admin/movies')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Error al guardar')
      console.error('Error completo:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
  }

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/movies">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-white">Editar: {form.title}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}

      {/* SECCIÓN IMÁGENES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {/* Poster */}
          <Card className="bg-gray-900/50 border-gray-800 p-3 md:p-4">
            <h3 className="text-white font-heading font-semibold text-xs md:text-sm mb-2 md:mb-3">Poster</h3>
            <ImageUpload
              label="Poster"
              bucket="peliculas"
              folder={movieId}
              value={form.poster_url}
              onChange={(url) => setForm(prev => ({ ...prev, poster_url: url }))}
              aspect="poster"
            />
          </Card>

          {/* Backdrop con opción de copiar Poster */}
          <Card className="bg-gray-900/50 border-gray-800 p-3 md:p-4">
            <h3 className="text-white font-heading font-semibold text-xs md:text-sm mb-2 md:mb-3">Backdrop</h3>
            <ImageUpload
              label="Backdrop"
              bucket="peliculas"
              folder={movieId}
              value={form.backdrop_url}
              onChange={(url) => setForm(prev => ({ ...prev, backdrop_url: url }))}
              aspect="video"
              allowCopyFrom={form.poster_url}
              copyLabel="Usar poster como backdrop"
              onCopyFrom={() => {
                const oldBackdrop = form.backdrop_url
                const newBackdrop = form.poster_url
                
                // Actualizar backdrop
                setForm(prev => ({ ...prev, backdrop_url: newBackdrop }))
                
                // Eliminar el backdrop viejo del bucket si era diferente
                if (oldBackdrop && oldBackdrop !== newBackdrop && oldBackdrop.includes('peliculas')) {
                  fetch('/api/admin/delete-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: oldBackdrop, bucket: 'peliculas' })
                  })
                }
              }}
            />
          </Card>

          {/* Banner Desktop */}
          <Card className="bg-gray-900/50 border-gray-800 p-3 md:p-4">
            <h3 className="text-white font-heading font-semibold text-xs md:text-sm mb-2 md:mb-3">Banner Desktop</h3>
            <ImageUpload
              label="Banner Desktop"
              bucket="banners"
              folder={movieId}
              value={form.promo_desktop_url}
              onChange={(url) => setForm(prev => ({ ...prev, promo_desktop_url: url }))}
              aspect="video"
              allowCopyFrom={form.backdrop_url}
              copyLabel="Usar backdrop como banner"
              onCopyFrom={() => setForm(prev => ({ ...prev, promo_desktop_url: prev.backdrop_url }))}
            />
          </Card>

          {/* Banner Mobile */}
          <Card className="bg-gray-900/50 border-gray-800 p-3 md:p-4">
            <h3 className="text-white font-heading font-semibold text-xs md:text-sm mb-2 md:mb-3">Banner Mobile</h3>
            <ImageUpload
              label="Banner Mobile"
              bucket="banners"
              folder={movieId}
              value={form.promo_mobile_url}
              onChange={(url) => setForm(prev => ({ ...prev, promo_mobile_url: url }))}
              aspect="square"
              allowCopyFrom={form.poster_url}
              copyLabel="Usar poster como banner mobile"
              onCopyFrom={() => setForm(prev => ({ ...prev, promo_mobile_url: prev.poster_url }))}
            />
          </Card>
        </div>

      {/* SECCIÓN INFORMACIÓN BÁSICA */}
      <Card className="bg-gray-900/50 border-gray-800 p-5 mb-6">
        <h3 className="text-white font-heading font-semibold mb-4">Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 mb-1 block">Título</label>
            <Input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
          <div>
            <DurationInput value={form.duration} onChange={(minutes) => setForm(prev => ({ ...prev, duration: minutes }))} />
          </div>
        </div>
        <Separator className="bg-gray-800 my-4" />
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Sinopsis</label>
          <textarea value={form.synopsis} onChange={(e) => setForm(prev => ({ ...prev, synopsis: e.target.value }))} rows={4} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 resize-none focus:border-red-500 focus:outline-none" />
        </div>
      </Card>

      {/* SECCIÓN DETALLES */}
      <Card className="bg-gray-900/50 border-gray-800 p-5 mb-6">
        <h3 className="text-white font-heading font-semibold mb-4">Detalles</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Rating</label>
            <Input type="number" step="0.1" value={form.rating} onChange={(e) => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Clasificación</label>
            <select value={form.classification} onChange={(e) => setForm(prev => ({ ...prev, classification: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:border-red-500 focus:outline-none">
              <option value="TE">TE</option>
              <option value="TE+7">TE+7</option>
              <option value="TE+12">TE+12</option>
              <option value="TE+16">TE+16</option>
              <option value="TE+18">TE+18</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Idioma</label>
            <LanguageSelect value={form.language} onChange={(lang) => setForm(prev => ({ ...prev, language: lang }))} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Fecha de Estreno</label>
            <Input type="date" value={form.release_date} onChange={(e) => setForm(prev => ({ ...prev, release_date: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
        </div>
        <Separator className="bg-gray-800 my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Director</label>
            <Input value={form.director} onChange={(e) => setForm(prev => ({ ...prev, director: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 mb-1 block">Elenco (separado por comas)</label>
            <Input value={form.movie_cast} onChange={(e) => setForm(prev => ({ ...prev, movie_cast: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
        </div>
        <Separator className="bg-gray-800 my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Géneros (separados por comas)</label>
            <Input value={form.genre} onChange={(e) => setForm(prev => ({ ...prev, genre: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Trailer URL</label>
            <Input value={form.trailer_url} onChange={(e) => setForm(prev => ({ ...prev, trailer_url: e.target.value }))} className="bg-gray-900 border-gray-700 text-white" />
          </div>
        </div>
      </Card>

      {/* SECCIÓN ESTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusSwitch
          label="Película Activa"
          description="Visible en la cartelera"
          checked={form.is_active}
          onChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
          color="green"
        />
        <StatusSwitch
          label="Próximo Estreno"
          description="Se muestra en la sección Próximamente"
          checked={form.is_coming_soon}
          onChange={(checked) => setForm(prev => ({ ...prev, is_coming_soon: checked }))}
          color="yellow"
        />
      </div>
    </div>
  )
}