'use client';

import { useState, useMemo, useCallback } from 'react';
import StoryCard from './StoryCard';

const LANG_LABELS = { es: 'Español', en: 'Inglés', fr: 'Francés', it: 'Italiano', ca: 'Català' };

const TIPOS = ['Todos', 'Personaje sonoro', 'Contenido digital', 'Juegos', 'Disco para grabación'];

const AGE_GROUPS = [
  { label: 'Todas', value: null },
  { label: '0–1', value: '0 – 1' },
  { label: '0–3', value: '0 – 3' },
  { label: '0+',  value: '0+' },
  { label: '1–3', value: '1 – 3' },
  { label: '1+',  value: '1+' },
  { label: '3–5', value: '3 – 5' },
  { label: '4–6', value: '4 – 6' },
  { label: '5–10', value: '5 – 10' },
];

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
  const [edad, setEdad] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stories.filter(s => {
      if (lang && s.idioma !== lang) return false;
      if (tipo && s.tipo !== tipo) return false;
      if (edad && s.edad !== edad) return false;
      if (q) {
        const haystack = [s.titulo, s.path, s.sku, s.coleccion, s.tipo]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [stories, search, lang, tipo, edad]);

  const toggle = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const uniqueLangs = Array.from(new Set(stories.map(s => s.idioma).filter(Boolean))).sort();
  const activeFilters = [lang, tipo, edad].filter(Boolean).length;

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

        <FilterBar label="👶 Edad">
          {AGE_GROUPS.map(a => (
            <button
              key={a.label}
              className={`filter-btn${edad === a.value ? ' active' : ''}`}
              onClick={() => setEdad(a.value)}
            >
              {a.label}
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
            onClick={() => { setSearch(''); setLang(null); setTipo(null); setEdad(null); }}
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
