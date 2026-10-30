import type { ReactNode } from 'react';
import { CommandBar, IconButton, Notification, SectionHeading, SidebarTabs, Spacer, Titlebar } from '../ds';
import { useApp, type TabId } from './AppContext';
import { TransfersPanel } from './TransfersPanel';
import { AppStatusBar } from './AppStatusBar';
import { Resizer, useStoredSize } from './Resizer';

const TABS = [
  { id: 'seedbox', label: 'Seedbox', icon: 'Cloud' },
  { id: 'library', label: 'Library', icon: 'LayoutGrid' },
  { id: 'discover', label: 'Discover', icon: 'Compass' },
  { id: 'servers', label: 'Servers', icon: 'Monitor' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

interface Props {
  commands: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
  dock?: ReactNode;
  modals?: ReactNode;
}

/** The shell from the design: titlebar, command bar, explorer | canvas | properties, transfers, status bar. */
export function Workbench({ commands, sidebar, main, dock, modals }: Props) {
  const { tab, setTab, theme, toggleTheme, msg, dismiss, status, winW } = useApp();
  const hasDock = dock != null && winW >= 1100;
  const dockDefault = winW >= 1280 ? 310 : 270;
  const [sideW, setSideW] = useStoredSize('sidebar', 300);
  const [dockStored, setDockW] = useStoredSize('dock', dockDefault);
  // Keep at least 360px for the canvas whatever the stored sizes are.
  const sideMax = Math.max(220, Math.min(580, winW - 360 - (hasDock ? dockStored : 0)));
  const side = Math.min(sideW, sideMax);
  const dockMax = Math.max(220, Math.min(640, winW - 360 - side));
  const dockW = Math.min(dockStored, dockMax);
  const host = status?.seedbox.configured ? status.seedbox.host : 'No seedbox configured';

  return (
    <div style={{ height: '100vh', minWidth: 760, display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 12, overflow: 'hidden' }}>
      <Titlebar icon="HardDrive" title="Seedbox Sync" context={host} tag={window.location.host} />
      <nav style={{ flex: 'none', display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: Math.min(620, winW), flex: 'none' }}>
          <SidebarTabs tabs={TABS} value={tab} onChange={id => setTab(id as TabId)} />
        </div>
      </nav>
      <CommandBar label="Commands">
        {commands}
        <Spacer />
        <IconButton
          icon={theme === 'dark' ? 'Sun' : 'Moon'}
          label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          onClick={toggleTheme}
        />
      </CommandBar>
      {msg && (
        <Notification key={msg.id} tone={msg.error ? 'error' : 'info'} onDismiss={dismiss}>
          {msg.text}
        </Notification>
      )}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <aside style={{ width: side, flex: 'none', display: 'flex', flexDirection: 'column', background: 'var(--surface)', minHeight: 0, minWidth: 0 }}>
          {sidebar}
        </aside>
        <Resizer axis="x" value={side} min={220} max={sideMax} defaultValue={300} onChange={setSideW} label="Resize explorer" />
        <main style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
          {main}
          <TransfersPanel />
        </main>
        {hasDock && <Resizer axis="x" invert value={dockW} min={220} max={dockMax} defaultValue={dockDefault} onChange={setDockW} label="Resize properties" />}
        {hasDock && (
          <aside style={{ width: dockW, flex: 'none', display: 'flex', flexDirection: 'column', background: 'var(--surface)', minHeight: 0, minWidth: 0 }}>
            <div style={{ height: 38, flex: 'none', display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid var(--border)' }}>
              <SectionHeading flush>Properties</SectionHeading>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>{dock}</div>
          </aside>
        )}
      </div>
      <AppStatusBar />
      {modals}
    </div>
  );
}
