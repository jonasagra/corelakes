import { useState } from 'react';
import { api } from '../../../utils/api';
import { showToast } from '../../../components/Toast';
import { IcShield, OreButton, OreInput } from './AdminControls';

export default function SecurityTab({ enabled, onChanged }) {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const startSetup = async () => {
    setBusy(true);
    try {
      const data = await api.post('/api/2fa/setup');
      setSetup({ qr: data.qr, secret: data.secret });
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async () => {
    if (!code.trim()) { showToast('Digite o código do app!', 'error'); return; }
    setBusy(true);
    try {
      await api.post('/api/2fa/enable', { code: code.trim() });
      showToast('2FA ativado!', 'success');
      setSetup(null);
      setCode('');
      onChanged();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (!code.trim()) { showToast('Digite o código do app para confirmar!', 'error'); return; }
    setBusy(true);
    try {
      await api.post('/api/2fa/disable', { code: code.trim() });
      showToast('2FA desativado.', 'success');
      setCode('');
      onChanged();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mc-panel p-5 mb-[30px]">
      <h2 className="font-mc-five text-[1.1rem] text-white mb-3 flex items-center gap-2" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
        <IcShield /> Verificação em duas etapas (2FA)
      </h2>

      {enabled ? (
        <div className="flex flex-col gap-[10px]">
          <p className="font-mc text-[0.85rem] text-mc-green-light">2FA está ATIVO ✓</p>
          <p className="font-mc text-[0.8rem] text-white/60">
            Para desativar, confirme com um código do seu app autenticador.
          </p>
          <OreInput label="Código (6 dígitos)" type="text" inputMode="numeric" placeholder="000000"
                   value={code} maxLength={6} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
          <OreButton variant="danger" disabled={busy} onClick={disable}>Desativar 2FA</OreButton>
        </div>
      ) : !setup ? (
        <div className="flex flex-col gap-[10px]">
          <p className="font-mc text-[0.8rem] text-white/60">
            Proteja o login com um app como Google Authenticator ou Authy.
          </p>
          <OreButton variant="primary" disabled={busy} onClick={startSetup}>
            {busy ? 'Gerando...' : 'Ativar 2FA'}
          </OreButton>
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          <p className="font-mc text-[0.8rem] text-white/70">
            1) Escaneie o QR no seu app autenticador:
          </p>
          <img src={setup.qr} alt="QR Code 2FA" className="w-[180px] h-[180px] border-[3px] border-mc-dark bg-white" />
          <p className="font-mc text-[0.75rem] text-white/50 break-all">
            Ou digite manualmente: <span className="text-mc-green-light">{setup.secret}</span>
          </p>
          <p className="font-mc text-[0.8rem] text-white/70">2) Confirme com o código gerado:</p>
          <OreInput label="Código (6 dígitos)" type="text" inputMode="numeric" placeholder="000000"
                   value={code} maxLength={6} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                   onKeyDown={e => e.key === 'Enter' && confirmEnable()} />
          <div className="flex gap-[10px]">
            <OreButton variant="primary" disabled={busy} onClick={confirmEnable}>Confirmar</OreButton>
            <OreButton variant="default" disabled={busy} onClick={() => { setSetup(null); setCode(''); }}>Cancelar</OreButton>
          </div>
        </div>
      )}
    </div>
  );
}
