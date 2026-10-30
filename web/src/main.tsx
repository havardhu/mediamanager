import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useApp } from './app/AppContext';
import { DiscoverTab } from './views/DiscoverTab';
import { LibraryTab } from './views/LibraryTab';
import { SeedboxTab } from './views/SeedboxTab';
import { ServersTab } from './views/ServersTab';
import { SettingsTab } from './views/SettingsTab';
import './styles/index.css';

function App() {
  const { tab } = useApp();
  if (tab === 'library') return <LibraryTab />;
  if (tab === 'discover') return <DiscoverTab />;
  if (tab === 'servers') return <ServersTab />;
  if (tab === 'settings') return <SettingsTab />;
  return <SeedboxTab />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
