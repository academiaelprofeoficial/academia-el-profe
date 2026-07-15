'use client';

// ============================================================
// Admin: Editar página /nosotros
// Permite modificar todo el contenido: título, historia,
// profesor fundador, foto, y 4 tarjetas de características.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Loader2, Upload, ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Caracteristica {
  icono: string;
  titulo: string;
  descripcion: string;
}

interface ContenidoNosotros {
  id: string;
  titulo_principal: string;
  subtitulo_principal: string;
  texto_historia: string;
  prof_nombre: string;
  prof_titulo: string;
  prof_descripcion: string;
  prof_foto_url: string;
  caracteristicas: Caracteristica[];
}

const CARACTERISTICAS_INIT: Caracteristica[] = [
  { icono: 'graduation-cap', titulo: 'Enfoque UTP', descripcion: '' },
  { icono: 'award', titulo: 'Experiencia Docente', descripcion: '' },
  { icono: 'users', titulo: 'Comunidad Activa', descripcion: '' },
  { icono: 'shield-check', titulo: 'Garantía de Calidad', descripcion: '' },
];

export default function AdminNosotrosPage() {
  const router = useRouter();
  const { user, isAdmin: isUserAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contenido, setContenido] = useState<ContenidoNosotros>({
    id: '',
    titulo_principal: '',
    subtitulo_principal: '',
    texto_historia: '',
    prof_nombre: '',
    prof_titulo: '',
    prof_descripcion: '',
    prof_foto_url: '',
    caracteristicas: CARACTERISTICAS_INIT,
  });

  // Auth guard
  useEffect(() => {
    if (!isUserAdmin && !loading) {
      router.replace('/iniciar-sesion');
    }
  }, [isUserAdmin, loading, router]);

  const cargarContenido = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/nosotros');
      const json = await res.json();
      if (json.data) {
        setContenido({
          id: json.data.id || '',
          titulo_principal: json.data.titulo_principal || '',
          subtitulo_principal: json.data.subtitulo_principal || '',
          texto_historia: json.data.texto_historia || '',
          prof_nombre: json.data.prof_nombre || '',
          prof_titulo: json.data.prof_titulo || '',
          prof_descripcion: json.data.prof_descripcion || '',
          prof_foto_url: json.data.prof_foto_url || '',
          caracteristicas: Array.isArray(json.data.caracteristicas) && json.data.caracteristicas.length > 0
            ? json.data.caracteristicas
            : CARACTERISTICAS_INIT,
        });
      }
    } catch (err) {
      console.error('Error cargando contenido:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarContenido();
  }, [cargarContenido]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContenido(prev => ({ ...prev, [name]: value }));
  };

  const handleCaracteristicaChange = (index: number, field: keyof Caracteristica, value: string) => {
    setContenido(prev => {
      const nuevas = [...prev.caracteristicas];
      nuevas[index] = { ...nuevas[index], [field]: value };
      return { ...prev, caracteristicas: nuevas };
    });
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen debe ser menor a 2MB' });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setContenido(prev => ({ ...prev, prof_foto_url: dataUrl }));
        setMessage({ type: 'success', text: 'Foto cargada. Guarda los cambios para confirmar.' });
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage({ type: 'error', text: 'Error al leer la imagen' });
    }
  };

  const guardarCambios = async () => {
    if (!contenido.id && !loading) {
      setMessage({ type: 'error', text: 'Error: ID de registro no encontrado. Recarga la página.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/nosotros', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contenido),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Cambios guardados correctamente' });
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `❌ ${err.message || 'Error al guardar los cambios'}` });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>No autorizado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-emerald-400 hover:text-emerald-300 mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Editar Página Nosotros</h1>
          <p className="text-gray-400 text-sm">
            Modifica el contenido de la página /nosotros
          </p>
        </div>

        {/* Mensaje */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* === CONTENIDO PRINCIPAL === */}
          <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full" />
              Contenido Principal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Título Principal
                </label>
                <input
                  type="text"
                  name="titulo_principal"
                  value={contenido.titulo_principal}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                  placeholder="Ej: Conoce al Prof. Bruno Díaz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  name="subtitulo_principal"
                  value={contenido.subtitulo_principal}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                  placeholder="Ej: Profesor de ingeniería con años de experiencia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Texto de Historia
                </label>
                <textarea
                  name="texto_historia"
                  value={contenido.texto_historia}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white resize-y"
                  placeholder="Historia de la academia..."
                />
              </div>
            </div>
          </section>

          {/* === PROFESOR FUNDADOR === */}
          <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full" />
              Profesor Fundador
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nombre del Profesor
                  </label>
                  <input
                    type="text"
                    name="prof_nombre"
                    value={contenido.prof_nombre}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Título / Cargo
                  </label>
                  <input
                    type="text"
                    name="prof_titulo"
                    value={contenido.prof_titulo}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Descripción
                </label>
                <textarea
                  name="prof_descripcion"
                  value={contenido.prof_descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Foto del Profesor
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg cursor-pointer transition-colors">
                    <Upload className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">Subir imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500">Máx 2MB</span>
                </div>
                {contenido.prof_foto_url && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={contenido.prof_foto_url}
                      alt="Foto del profesor"
                      className="w-20 h-20 rounded-xl object-cover border border-gray-600"
                    />
                    <button
                      onClick={() => setContenido(prev => ({ ...prev, prof_foto_url: '' }))}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
                {!contenido.prof_foto_url && (
                  <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
                    <ImageIcon className="h-5 w-5" />
                    Sin foto
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* === CARACTERÍSTICAS === */}
          <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full" />
              Características (4 Tarjetas)
            </h2>
            <div className="space-y-6">
              {contenido.caracteristicas.map((caracteristica, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-5">
                  <h3 className="font-medium mb-3 flex items-center gap-2 text-emerald-400">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900/50 text-xs font-bold">
                      {index + 1}
                    </span>
                    Tarjeta {index + 1}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Icono (nombre del icono en Lucide React)
                      </label>
                      <input
                        type="text"
                        value={caracteristica.icono}
                        onChange={(e) => handleCaracteristicaChange(index, 'icono', e.target.value)}
                        placeholder="graduation-cap, award, users, shield-check..."
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Título
                      </label>
                      <input
                        type="text"
                        value={caracteristica.titulo}
                        onChange={(e) => handleCaracteristicaChange(index, 'titulo', e.target.value)}
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Descripción
                      </label>
                      <textarea
                        value={caracteristica.descripcion}
                        onChange={(e) => handleCaracteristicaChange(index, 'descripcion', e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white text-sm resize-y"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* === BOTONES === */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={guardarCambios}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => window.open('/nosotros', '_blank')}
              className="flex items-center justify-center gap-2 px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition"
            >
              <Eye className="h-5 w-5" />
              Ver Página
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
