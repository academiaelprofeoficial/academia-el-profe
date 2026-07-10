'use client';

// ============================================================
// /admin/videos — Biblioteca de Videos
// Muestra todos los videos subidos a la biblioteca (videoLibrary)
// con información de qué cursos los usan.
// Desde aquí el admin puede navegar al Sanity Studio para
// crear nuevos videos o asignarlos a cursos.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Video,
  Search,
  Tag,
  ExternalLink,
  BookOpen,
  Clock,
  FileVideo,
  Globe,
  Loader2,
  Film,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';

interface VideoUsage {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  topicTitle: string;
  classTitle: string;
}

interface VideoItem {
  _id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  webmUrl: string | null;
  duration: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  tags: string[];
  hasFile: boolean;
  fileSize: number;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
  courseCount: number;
  usages: VideoUsage[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(months / 12)} anos`;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedTag) params.set('tag', selectedTag);

      const res = await fetch(`/api/admin/videos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
        setAllTags(data.allTags || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, selectedTag]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const copyVideoId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalCoursesUsing = videos.reduce((sum, v) => sum + v.courseCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Film className="h-7 w-7 text-emerald-600" />
                Biblioteca de Videos
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {videos.length} video{videos.length !== 1 ? 's' : ''} en la biblioteca
                {totalCoursesUsing > 0 && ` · ${totalCoursesUsing} uso${totalCoursesUsing !== 1 ? 's' : ''} en cursos`}
              </p>
            </div>
            <Link
              href="/admin/cms/structure/video-library-list"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
            >
              <Video className="h-4 w-4" />
              Crear Video en Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search + Tags */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar videos por titulo, descripcion o etiqueta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedTag
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-20">
            <Film className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {search || selectedTag ? 'Sin resultados' : 'Biblioteca vacia'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {search || selectedTag
                ? 'No se encontraron videos con los filtros aplicados.'
                : 'Aun no hay videos en la biblioteca. Crea el primer video desde Sanity Studio.'}
            </p>
            {!search && !selectedTag && (
              <Link
                href="/admin/cms/structure/video-library-list;videoLibrary"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                <Video className="h-4 w-4" />
                Crear Primer Video
              </Link>
            )}
          </div>
        )}

        {/* Video list */}
        {!loading && videos.length > 0 && (
          <div className="space-y-3">
            {videos.map((video) => {
              const isExpanded = expandedId === video._id;
              return (
                <div
                  key={video._id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  {/* Video row */}
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : video._id)}
                  >
                    {/* Thumbnail or placeholder */}
                    <div className="w-20 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.thumbnailAlt || video.title} className="w-full h-full object-cover" />
                      ) : (
                        <Video className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {video.courseCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              <BookOpen className="h-3 w-3" />
                              {video.courseCount}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        {video.duration && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </span>
                        )}
                        {video.hasFile && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <FileVideo className="h-3 w-3" />
                            {formatBytes(video.fileSize)}
                          </span>
                        )}
                        {video.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Globe className="h-3 w-3" />
                            URL externa
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {video.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400"
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
                      {/* Description */}
                      {video.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {video.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500">ID</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <code className="text-slate-700 dark:text-slate-300 truncate">
                              {video._id.slice(-8)}
                            </code>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyVideoId(video._id); }}
                              className="text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              {copiedId === video._id ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500">Creado</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5">{timeAgo(video.createdAt)}</p>
                        </div>
                        {video.mimeType && (
                          <div>
                            <span className="text-slate-400 dark:text-slate-500">Formato</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{video.mimeType.replace('video/', '').toUpperCase()}</p>
                          </div>
                        )}
                        {video.webmUrl && (
                          <div>
                            <span className="text-slate-400 dark:text-slate-500">WebM</span>
                            <p className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Disponible</p>
                          </div>
                        )}
                      </div>

                      {/* Course usage */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Usado en {video.courseCount} curso{video.courseCount !== 1 ? 's' : ''}
                        </h4>
                        {video.usages.length > 0 ? (
                          <div className="space-y-1.5">
                            {video.usages.map((usage, i) => (
                              <Link
                                key={`${usage.courseId}-${usage.topicTitle}-${i}`}
                                href={`/admin/cms/desk/course;${usage.courseId}`}
                                target="_blank"
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors group"
                              >
                                <BookOpen className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate block">
                                    {usage.courseTitle}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {usage.topicTitle} → {usage.classTitle}
                                  </span>
                                </div>
                                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Este video aun no esta asignado a ningun curso.
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Link
                          href={`/admin/cms/desk/videoLibrary;${video._id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Editar en Studio
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* How to assign */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Como reutilizar un video en un curso
          </h3>
          <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside">
            <li>Sube el video a la <strong>Biblioteca de Videos</strong> desde Sanity Studio.</li>
            <li>Abre el curso donde quieres usarlo en <strong>Studio → Cursos</strong>.</li>
            <li>Navega al tema y agrega una nueva <strong>Clase del Tema</strong>.</li>
            <li>En la clase, selecciona el campo <strong>&quot;Video de Biblioteca (Reutilizable)&quot;</strong> y elige el video.</li>
            <li>El video se usara sin duplicar el archivo. Los cambios en la biblioteca se reflejan en todos los cursos.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}