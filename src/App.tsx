import { useState } from 'react';
import { House, Shield, TrendingUp, Users, Settings as Cog } from 'lucide-react';
import { Provider, useApp, Tab } from './store';
import Welcome from './screens/Welcome';
import Home from './screens/Home';
import Focus from './screens/Shield';
import Predict from './screens/Predict';
import Social from './screens/Social';
import Settings from './screens/Settings';

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: 'home', label: 'Accueil', Icon: House },
  { id: 'shield', label: 'Bouclier', Icon: Shield },
  { id: 'predict', label: 'Tendances', Icon: TrendingUp },
  { id: 'social', label: 'Social', Icon: Users },
  { id: 'settings', label: 'Réglages', Icon: Cog },
];

function Shell() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  if (!state.onboarded) return <Welcome />;
  const screen = { home: <Home goto={setTab} />, shield: <Focus />, predict: <Predict />, social: <Social />, settings: <Settings /> }[tab];
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-28" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="flex items-center gap-2 px-5 pt-4">
        <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
        <span className="font-extrabold tracking-tight">Sixième Sens</span>
      </header>
      {state.mode === 'demo' && (
        <div className="mx-5 mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Mode démo : ces données sont fictives. Tu peux les quitter dans Réglages.
        </div>
      )}
      {screen}
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-line bg-ink/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="flex">
          {TABS.map(({ id, label, Icon }) => (
            <li key={id} className="flex-1">
              <button onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 py-3 text-[11px] font-semibold ${tab === id ? 'text-violet-400' : 'text-muted'}`}>
                <Icon size={21} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {state.nightMode && <div className="pointer-events-none fixed inset-0 z-50 bg-[rgba(255,140,40,.16)] mix-blend-multiply" />}
    </div>
  );
}

export default function App() {
  return <Provider><Shell /></Provider>;
}
