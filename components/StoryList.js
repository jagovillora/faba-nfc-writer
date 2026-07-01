'use client';

import { useState, useMemo, useCallback } from 'react';
import StoryCard from './StoryCard';

const LANGS = ['Todos', 'es', 'en', 'fr', 'it'];
const LANG_LABELS = { es: 'Español', en: 'Inglés', fr: 'Francés', it: 'Italiano' };
const TIPOS = ['Todos', 'Personaje sonoro', 'Contenido digital', 'Juegos', 'Disco para grabación'];

export default function StoryList({ stories }) {
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('Todos');
  const [tipo, setTipo] = useState('Todos');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stories.filter(s => {
      if (lang !== 'Todos' && s.idioma !== lang) return false;
      if (tipo !== 'Todos' && s.tipo !== tipo) return false;
      if (q) {
        const haystack = [s.titulo, s.path, s.sku, s.coleccion, s.tipo]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [stories, search, lang, tipo]);

  const toggle = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const uniqueLangs = ['Todos', ...Array.from(new Set(stories.map(s => s.idioma).filter(Boolean))).sort()];

  return (
    <>
      <header className="header">
        <h1>🔊 FABA NFC Writer</h1>
        <p>Graba etiquetas NFC para tu FABA · {stories.length} cuentos</p>
        <input
          className="search-bar"
          type="search"
          placeholder="Buscar cuento, código, colección..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
        />
      </header>

      <div className="filters">
        {uniqueLangs.map(l => (
          <button
            key={l}
            className={`filter-btn${lang === l ? ' active' : ''}`}
            onClick={() => setLang(l)}
          >
            {LANG_LABELS[l] ?? l}
          </button>
        ))}
        <span style={{ width: 1, background: '#e5e7eb', flexShrink: 0 }} />
        {TIPOS.map(t => (
          <button
            key={t}
            className={`filter-btn${tipo === t ? ' active' : ''}`}
            onClick={() => setTipo(t)}
          >
            {t === 'Todos' ? '📦 Todos' : t}
          </button>
        ))}
      </div>

      <div className="stats">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {(search || lang !== 'Todos' || tipo !== 'Todos') ? ' (filtrado)' : ''}
      </div>

      <div className="list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <p>No se encontraron cuentos con esos filtros</p>
          </div>
        ) : (
          filtered.map((story, i) => (
            <StoryCard
              key={story.path ? story.path + i : story.titulo + i}
              story={story}
              expanded={expandedId === (story.path ?? story.titulo + i)}
              onToggle={() => toggle(story.path ?? story.titulo + i)}
            />
          ))
        )}
      </div>
    </>
  );
}
