'use client';

import { useState, useEffect, useCallback } from 'react';

const SETUP_STEPS = [
  { icon: '📱', text: <>Abre la app <strong>Atajos</strong> en tu iPhone</> },
  { icon: '＋', text: <>Pulsa el botón <strong>+</strong> arriba a la derecha</> },
  { icon: '🔍', text: <>Toca <strong>Añadir acción</strong> y busca <em>"Escribir etiqueta NFC"</em></> },
  { icon: '✏️', text: <>En el campo de texto, toca y elige la variable <strong>"Entrada del atajo"</strong></> },
  { icon: '🏷️', text: <>Pulsa <strong>"Atajo sin título"</strong> arriba y escribe exactamente: <code>FABA NFC</code></> },
  { icon: '✅', text: <>Toca <strong>Listo</strong> — ¡ya está! Solo hay que hacerlo una vez</> },
];

function IOSShortcutSection({ code, onCopy, onWrite }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="ios-section">
      <div className="action-row">
        <button className="btn btn-primary" onClick={onWrite}>
          📲 Escribir con Shortcuts
        </button>
        <button className="btn btn-secondary" onClick={onCopy}>
          📋 Copiar
        </button>
      </div>

      <button
        className="ios-guide-toggle"
        onClick={() => setShowGuide(v => !v)}
        aria-expanded={showGuide}
      >
        {showGuide ? '▲' : '▼'} {showGuide ? 'Ocultar guía de configuración' : '¿Primera vez? Configura el Shortcut (30 seg)'}
      </button>

      {showGuide && (
        <div className="ios-guide">
          <p className="ios-guide-intro">
            Safari no puede tocar el NFC directamente (limitación de Apple).
            La app <strong>Atajos</strong> sí puede. Crea este atajo una sola vez:
          </p>
          <ol className="ios-steps-list">
            {SETUP_STEPS.map((s, i) => (
              <li key={i} className="ios-step">
                <span className="ios-step-icon">{s.icon}</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <div className="ios-guide-after">
            Después vuelve aquí y pulsa <strong>Escribir con Shortcuts</strong>.
            La app Atajos se abre sola, acercas la etiqueta NTAG213 y graba el código.
          </div>
        </div>
      )}
    </div>
  );
}

const LANG_FLAGS = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷', it: '🇮🇹' };
const SHORTCUT_NAME = 'FABA NFC';

function formatNfcCode(code) {
  if (!code) return null;
  return {
    prefix: code.slice(0, 8),
    pathDigits: code.slice(8, 12),
    suffix: code.slice(12),
  };
}

export default function StoryCard({ story, expanded, onToggle }) {
  const [status, setStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [platform, setPlatform] = useState('unknown');
  const [hasWebNFC, setHasWebNFC] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'desktop');
    setHasWebNFC(typeof NDEFReader !== 'undefined');
  }, []);

  const code = story.nfc_code;
  const parts = formatNfcCode(code);

  async function writeNFC() {
    setStatus('writing');
    setStatusMsg('📡 Acerca la etiqueta NFC al teléfono…');
    try {
      const ndef = new NDEFReader();
      await ndef.write({ records: [{ recordType: 'text', data: code, lang: 'es' }] });
      setStatus('success');
      setStatusMsg('✅ ¡Etiqueta grabada!');
    } catch (err) {
      setStatus('error');
      const msgs = {
        NotAllowedError: '❌ Permiso denegado. Activa NFC en ajustes.',
        NotSupportedError: '❌ NFC no disponible en este dispositivo.',
        AbortError: '⚠️ Cancelado. Vuelve a intentarlo.',
      };
      setStatusMsg(msgs[err.name] ?? `❌ ${err.message}`);
    }
  }

  function openShortcut() {
    // Pass the NFC code to the pre-installed shortcut
    const url = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME)}&input=${encodeURIComponent(code)}`;
    window.location.href = url;
    setStatus('writing');
    setStatusMsg('📲 Abriendo Shortcuts… acerca la etiqueta cuando te lo pida.');
    // Reset after a moment (we can't detect Shortcuts result from web)
    setTimeout(() => setStatus(null), 6000);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('success');
      setStatusMsg('✅ Código copiado');
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus('error');
      setStatusMsg('Copia manualmente: ' + code);
    }
  }

  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';

  return (
    <div className={`card${expanded ? ' expanded' : ''}`}>
      <div
        className="card-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
      >
        {story.image ? (
          <img src={story.image} alt={story.titulo} className="card-thumb" loading="lazy" />
        ) : (
          <div className={`path-badge${!code ? ' no-nfc' : ''}`}>
            {story.path ?? 'SIN'}
          </div>
        )}
        <div className="card-info">
          <div className="card-title">{story.titulo}</div>
          {story.image && story.path && (
            <div className="path-inline">{story.path}</div>
          )}
          <div className="card-meta">
            {story.idioma && <span className="meta-tag">{LANG_FLAGS[story.idioma] ?? '🌍'} {story.idioma}</span>}
            {story.duracion && <span className="meta-tag">⏱ {story.duracion}</span>}
            {story.edad && <span className="meta-tag">👶 {story.edad}</span>}
            {story.capitulos && <span className="meta-tag">📑 {story.capitulos} caps</span>}
            {story.tipo && <span className="tipo-badge">{story.tipo}</span>}
          </div>
        </div>
        <span className="chevron">›</span>
      </div>

      {expanded && (
        <div className="card-body">
          {story.url && (
            <div style={{ marginTop: 10 }}>
              <a href={story.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>
                🔗 Ver en myfaba.es ↗
              </a>
            </div>
          )}

          <div className="nfc-section">
            <div className="nfc-label">Código a grabar</div>

            {code ? (
              <>
                <div className="nfc-code-box">
                  {parts.prefix}<span title={`Path: ${story.path}`}>{parts.pathDigits}</span>{parts.suffix}
                </div>

                {/* Android: Web NFC direct write */}
                {(isAndroid || hasWebNFC) && (
                  <div className="action-row">
                    <button className="btn btn-primary" onClick={writeNFC} disabled={status === 'writing'}>
                      📳 Escribir en NFC
                    </button>
                    <button className="btn btn-secondary" onClick={copyCode}>
                      📋 Copiar
                    </button>
                  </div>
                )}

                {/* iOS: Shortcuts flow */}
                {isIOS && !hasWebNFC && (
                  <IOSShortcutSection code={code} onCopy={copyCode} onWrite={openShortcut} />
                )}

                {/* Desktop fallback */}
                {!isIOS && !isAndroid && !hasWebNFC && (
                  <div className="action-row">
                    <button className="btn btn-secondary" onClick={copyCode}>
                      📋 Copiar código
                    </button>
                  </div>
                )}

                {status && (
                  <div className={`status-msg ${status}`}>{statusMsg}</div>
                )}
              </>
            ) : (
              <div className="no-nfc-msg">
                Contenido solo digital — sin código de etiqueta NFC asignable.
              </div>
            )}
          </div>

          {story.sku && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
              SKU: {story.sku}{story.id ? ` · ID: ${story.id}` : ''}{story.coleccion ? ` · ${story.coleccion}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
