export default function SecurityTab({ enabled, onChanged }) {
  return (
    <section className="mc-panel p-[25px] mb-[30px]">
      <h2 className="font-mc-five text-[1.2rem] text-white mb-4" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>Segurança</h2>
      <p className="text-white/70 mb-3">2FA: {enabled ? 'ativado' : 'desativado'}</p>
      <button className="mc-btn" onClick={onChanged}>Atualizar</button>
    </section>
  );
}
