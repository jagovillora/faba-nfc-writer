'use client';

import { useState, useEffect } from 'react';

const LANG_FLAGS = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷', it: '🇮🇹' };

function formatNfcCode(code) {
  if (!code) return null;
  // Highlight the path digits (positions 8-11, the 0400 part)
  const prefix = code.slice(0, 8);
  const pathDigits = code.slice(8, 12);
  const suffix = code.slice(12);
  return { prefix, pathDigits, suffix };
}

export default function StoryCard({ story, expanded, onToggle }) {
  const [status, setStatus] = useState(null); // null | 'writing' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [isAndroid, setIsAndroid] = useState(false);
  const [hasNFC, setHasNFC] = useState(false);

  useEffect(() => {
    const android = /android/i.test(navigator.userAgent);
    setIsAndroid(android);
    setHasNFC(typeof NDEFReader !== 'undefined');
  }, []);

  const code = story.nfc_code;
  const parts = formatNfcCode(code);

  async function writeNFC() {
    if (!code) return;
    setStatus('writing');
    setStatusMsg('📡 Acerca la etiqueta NFC al teléfono...');
    try {
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: 'text', data: code, lang: 'es' }]
      });
      setStatus('success');
      setStatusMsg('✅ ¡Etiqueta grabada con éxito!');
    } catch (err) {
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setStatusMsg('❌ Permiso denegado. Activa NFC en ajustes.');
      } else if (err.name === 'NotSupportedError') {
        setStatusMsg('❌ NFC no disponible en este dispositivo.');
      } else {
        setStatusMsg(`❌ Error: ${err.message}`);
      }
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setStatus('success');
      setStatusMsg('✅ Código copiado al portapapeles');
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus('error');
      setStatusMsg('No se pudo copiar. Copia manualmente.');
    }
  }

  return (
    <div className={`card${expanded ? ' expanded' : ''}`}>
      <div className="card-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}>
        <div className={`path-badge${!code ? ' no-nfc' : ''}`}>
          {story.path ?? 'SIN CÓDIGO'}
        </div>
        <div className="card-info">
          <div className="card-title">{story.titulo}</div>
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
            <div className="nfc-label">Código a grabar en la etiqueta NFC</div>

            {code ? (
              <>
                <div className="nfc-code-box">
                  {parts.prefix}
                  <span title={`Path: ${story.path}`}>{parts.pathDigits}</span>
                  {parts.suffix}
                </div>

                <div className="action-row">
                  {hasNFC && isAndroid ? (
                    <button className="btn btn-primary" onClick={writeNFC}
                      disabled={status === 'writing'}>
                      📳 Escribir en NFC
                    </button>
                  ) : null}
                  <button className="btn btn-secondary" onClick={copyCode}>
                    📋 Copiar código
                  </button>
                </div>

                {!hasNFC && (
                  <div className="ios-note">
                    ℹ️ <strong>iOS / sin NFC web:</strong> Copia el código y pégalo en
                    {' '}<strong>NFC Tools</strong> → Escribir → Añadir registro → Texto.
                    Acerca la etiqueta NTAG213 y pulsa Escribir.
                  </div>
                )}

                {status && (
                  <div className={`status-msg ${status}`}>{statusMsg}</div>
                )}
              </>
            ) : (
              <div className="no-nfc-msg">
                Este contenido es solo digital y no tiene código de etiqueta NFC asignable.
              </div>
            )}
          </div>

          {story.sku && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
              SKU: {story.sku} {story.id ? `· ID: ${story.id}` : ''} {story.coleccion ? `· ${story.coleccion}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
