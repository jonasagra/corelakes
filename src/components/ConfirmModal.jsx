'use client';

import { useEffect, useState } from 'react';

let _resolve = null;
let _state = { open: false, title: '', message: '', confirmText: 'OK', danger: false };

export function confirmDialog({ title, message, confirmText = 'OK', danger = false }) {
  _state = { open: true, title, message, confirmText, danger };
  return new Promise((resolve) => {
    _resolve = resolve;
  });
}

export default function ConfirmModal() {
  const [state, setState] = useState(_state);

  useEffect(() => {
    const handler = () => setState(_state);
    handler();
    return () => {
      _resolve = null;
    };
  }, []);

  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md border border-black bg-[#1b1b1c] p-6 shadow-2xl">
        <h3 className="font-mc-five text-xl text-white mb-3">{state.title}</h3>
        <p className="text-white/75 mb-6">{state.message}</p>
        <div className="flex justify-end gap-3">
          <button className="mc-btn" onClick={() => { _state = { ..._state, open: false }; setState(_state); _resolve?.(false); _resolve = null; }}>
            Cancelar
          </button>
          <button className={`mc-btn ${state.danger ? 'mc-btn-danger' : 'mc-btn-solid'}`} onClick={() => { _state = { ..._state, open: false }; setState(_state); _resolve?.(true); _resolve = null; }}>
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
