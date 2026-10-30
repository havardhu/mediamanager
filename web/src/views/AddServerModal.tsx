import { useState } from 'react';
import { api } from '../api/client';
import type { DiscoveredPeer, MediaServer } from '../api/types';
import { Button, ButtonRow, Eyebrow, Field, Hint, Icon, InlineStatus, Modal, TextInput } from '../ds';

interface Props {
  peers: DiscoveredPeer[];
  /** Opened from a PC in the "On your network" list: skip straight to the code. */
  initial?: DiscoveredPeer | null;
  onClose: () => void;
  onAdded: (server: MediaServer) => void;
  onError: (e: unknown) => void;
}

type Step = 'choose' | 'code' | 'found';

const hostOf = (address: string) => address.replace(/^https?:\/\//, '').replace(/:\d+$/, '');

/**
 * Add another PC running Seedbox Sync: pick it (found on the network, or by address), type the
 * pairing code it shows, then name it and check its library folder.
 */
export function AddServerModal({ peers, initial, onClose, onAdded, onError }: Props) {
  const [step, setStep] = useState<Step>(initial ? 'code' : 'choose');
  const [target, setTarget] = useState<{ address: string; name: string } | null>(initial ? { address: initial.address, name: initial.name } : null);
  const [manual, setManual] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<MediaServer | null>(null);
  const [name, setName] = useState('');
  const [root, setRoot] = useState('');

  const chosen = target ?? (manual.trim() ? { address: manual.trim(), name: manual.trim() } : null);
  const codeChars = code.replace(/[^a-z0-9]/gi, '');

  const pair = async () => {
    if (!chosen || codeChars.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const s = await api.pairServer(chosen.address, codeChars);
      setServer(s);
      setName(s.name);
      setRoot(s.libraryRoot);
      setStep('found');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!server) return;
    setBusy(true);
    try {
      const body: { name?: string; libraryRoot?: string } = {};
      if (name.trim() && name.trim() !== server.name) body.name = name.trim();
      if (root.trim() && root.trim() !== server.libraryRoot) body.libraryRoot = root.trim();
      onAdded(Object.keys(body).length ? await api.updateServer(server.id, body) : server);
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  };

  // Typed code, shown as K7Q-4XM.
  const onCode = (v: string) => {
    const c = v.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
    setCode(c.length > 3 ? c.slice(0, 3) + '-' + c.slice(3) : c);
  };

  const title = step === 'found' ? 'Name the server' : step === 'code' ? `Pair with ${target?.name ?? hostOf(chosen?.address ?? '')}` : 'Pair a media PC';

  return (
    <Modal eyebrow="Add media server" title={title} width="500px" gap={14} onClose={onClose}>
      {step === 'choose' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow>1 · Choose the PC</Eyebrow>
            {peers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflow: 'auto' }}>
                {peers.map(p => {
                  const on = target?.address === p.address;
                  return (
                    <button
                      key={p.instanceId}
                      type="button"
                      className="hov-card"
                      onClick={() => { setTarget({ address: p.address, name: p.name }); setManual(''); }}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 4, border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-soft)' : 'transparent', fontFamily: 'inherit', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="Monitor" size={16} /></span>
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{hostOf(p.address)} · Seedbox Sync {p.version}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--border)', borderRadius: 4, padding: 14, fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>
                Looking for other PCs running Seedbox Sync on this network...
              </div>
            )}
          </div>
          <Field label="Or enter its address">
            <TextInput
              mono
              value={manual}
              placeholder="192.168.1.31"
              onChange={e => { setManual(e.target.value); setTarget(null); }}
              onKeyDown={e => { if (e.key === 'Enter' && chosen) { e.preventDefault(); setStep('code'); } }}
            />
          </Field>
          <Hint>Install Seedbox Sync on the other PC and start it. It downloads straight from the seedbox; nothing passes through this PC. If it does not show up, check that both PCs are on a private network and that its firewall allows Seedbox Sync (scripts\allow-lan.ps1).</Hint>
          <ButtonRow>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon="ArrowRight" disabled={!chosen} onClick={() => setStep('code')}>Next</Button>
          </ButtonRow>
        </>
      )}

      {step === 'code' && chosen && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow>2 · Enter the pairing code shown on {target?.name ?? 'that PC'}</Eyebrow>
            <Hint>On {target?.name ?? 'the other PC'}, open Seedbox Sync, go to Servers, select This PC and choose Show pairing code.</Hint>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <input
              aria-label="Pairing code"
              value={code}
              onChange={e => onCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); pair(); } }}
              placeholder="K7Q-4XM"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              style={{ width: 200, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 26, letterSpacing: 4, background: 'transparent', border: 0, outline: 'none', color: 'var(--text)' }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{hostOf(chosen.address)}</div>
          {error && <div style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--error)' }}>{error}</div>}
          <ButtonRow align="between">
            {initial ? <span /> : <Button icon="ArrowLeft" onClick={() => { setStep('choose'); setError(null); }}>Back</Button>}
            <div style={{ display: 'flex', gap: 6 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary" icon="Link" disabled={codeChars.length !== 6 || busy} onClick={pair}>{busy ? 'Pairing...' : 'Pair'}</Button>
            </div>
          </ButtonRow>
        </>
      )}

      {step === 'found' && server && (
        <>
          <InlineStatus>{`Paired with ${server.name} at ${hostOf(server.address ?? '')}`}</InlineStatus>
          <Field label="Name">
            <TextInput value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="Library root on that PC">
            <TextInput mono value={root} onChange={e => setRoot(e.target.value)} placeholder="D:\Media" />
          </Field>
          <Hint>The seedbox folder structure is mirrored under this path. Nothing downloads until you choose Download for a file or folder.</Hint>
          <ButtonRow>
            <Button variant="primary" icon="Check" disabled={busy} onClick={finish}>Done</Button>
          </ButtonRow>
        </>
      )}
    </Modal>
  );
}
