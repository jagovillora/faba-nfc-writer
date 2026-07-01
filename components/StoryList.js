'use client';

import { useState, useMemo, useCallback } from 'react';
import StoryCard from './StoryCard';

const LANG_LABELS = { es: 'Español', en: 'Inglés', fr: 'Francés', it: 'Italiano', ca: 'Català' };

const TIPOS = ['Personaje sonoro', 'Contenido digital', 'Juegos', 'Disco para grabación'];

function FilterBar({ label, children }) {
  return (
    <div className="filter-group">
      <span className="filter-group-label">{label}</span>
      <div className="filter-chips">{children}</div>
    </div>
  );
}

export default function StoryList({ stories }) {
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stories.filter(s => {
      if (lang && s.idioma !== lang) return false;
      if (tipo && s.tipo !== tipo) return false;
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

  const uniqueLangs = Array.from(new Set(stories.map(s => s.idioma).filter(Boolean))).sort();
  const activeFilters = [lang, tipo].filter(Boolean).length;

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

      <div className="filters-panel">
        <FilterBar label="🌍 Idioma">
          <button className={`filter-btn${!lang ? ' active' : ''}`} onClick={() => setLang(null)}>Todos</button>
          {uniqueLangs.map(l => (
            <button key={l} className={`filter-btn${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
              {LANG_LABELS[l] ?? l}
            </button>
          ))}
        </FilterBar>

        <FilterBar label="📦 Tipo">
          <button className={`filter-btn${!tipo ? ' active' : ''}`} onClick={() => setTipo(null)}>Todos</button>
          {TIPOS.slice(1).map(t => (
            <button key={t} className={`filter-btn${tipo === t ? ' active' : ''}`} onClick={() => setTipo(t)}>
              {t}
            </button>
          ))}
        </FilterBar>
      </div>

      <div className="stats">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {(search || activeFilters > 0) ? ` · ${activeFilters} filtro${activeFilters !== 1 ? 's' : ''} activo${activeFilters !== 1 ? 's' : ''}` : ''}
        {(search || activeFilters > 0) && (
          <button
            className="clear-filters"
            onClick={() => { setSearch(''); setLang(null); setTipo(null); }}
          >
            ✕ Limpiar
          </button>
        )}
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
