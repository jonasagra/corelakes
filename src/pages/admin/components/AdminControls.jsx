export const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

export const OreInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="font-mc text-[0.78rem] uppercase tracking-[1px] text-mc-green-link">{label}</label>}
    <input
      className="admin-input w-full px-4 py-3 oreUI-text text-base bg-[#0d0d0d] border border-[#2f2f2f] placeholder-white/40 focus:outline-none focus:border-mc-green-bright transition-colors"
      {...props}
    />
  </div>
);

export const OreButton = ({ variant = 'default', disabled, children, className = '', ...props }) => {
  const v = variant === 'primary' ? 'mc-btn mc-btn-solid'
          : variant === 'danger'  ? 'mc-btn mc-btn-danger'
          : 'mc-btn';
  return (
    <button
      disabled={disabled}
      className={`${v} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const svgBase = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IcShield = (p) => (
  <svg {...svgBase} {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /></svg>
);
export const IcImage = (p) => (
  <svg {...svgBase} {...p}><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="8.5" cy="9" r="1.5" /><path d="M21 16l-5-5L5 20" /></svg>
);
export const IcUpload = (p) => (
  <svg {...svgBase} {...p}><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 20h14" /></svg>
);
export const IcSave = (p) => (
  <svg {...svgBase} {...p}><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h7" /><path d="M8 21v-7h8v7" /></svg>
);
export const IcTrash = (p) => (
  <svg {...svgBase} {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 14h10l1-14" /></svg>
);
