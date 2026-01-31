import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ────────────────────────────────────────────────────────
 * Global toast bus  –  import { showToast } anywhere.
 *   showToast('Saved!', 'success')   // 'success' | 'error' | 'info'
 * ──────────────────────────────────────────────────────── */
let _setToast = null;
export function showToast(message, type = 'info') {
  _setToast?.({ message, type, id: Date.now() });
}

const BG = {
  success: 'bg-mc-green',
  error:   'bg-mc-red',
  info:    'bg-mc-bg',
};

export default function Toast() {
  const [toast, setToast] = useState(null);

  // register the global setter once
  useEffect(() => { _setToast = setToast; return () => { _setToast = null; }; }, []);

  // auto-dismiss after 4 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return createPortal(
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[300] transition-opacity duration-300">
      <div className={`${BG[toast.type]} text-white font-mc text-sm px-6 py-3 border-[3px] border-mc-dark`}>
        {toast.message}
      </div>
    </div>,
    document.body
  );
}
