import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* ────────────────────────────────────────────────────────
 * Modal de confirmação global (no lugar do confirm() nativo).
 *   const ok = await confirmDialog({ title, message, confirmText, danger })
 *   if (!ok) return;
 * ──────────────────────────────────────────────────────── */
let _show = null;
export function confirmDialog(opts = {}) {
  return new Promise((resolve) => {
    if (!_show) { resolve(false); return; }
    _show({ ...opts, resolve });
  });
}

export default function ConfirmModal() {
  const [state, setState] = useState(null);

  useEffect(() => { _show = setState; return () => { _show = null; }; }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return null;

  const {
    title = 'Tem certeza?',
    message = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    danger = false,
    resolve,
  } = state;

  const close = (val) => { resolve?.(val); setState(null); };

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-5"
         style={{ background: 'rgba(0,0,0,0.65)' }}
         onClick={() => close(false)}>
      <div className="mc-panel w-full max-w-[420px] p-7" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-mc-five text-[1.2rem] text-white mb-3" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
          {title}
        </h2>
        {message && (
          <p className="text-white/80 text-[0.95rem] leading-[1.6] mb-6">{message}</p>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={() => close(false)} className="mc-btn">{cancelText}</button>
          <button onClick={() => close(true)} className={`mc-btn ${danger ? 'mc-btn-danger' : 'mc-btn-solid'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
