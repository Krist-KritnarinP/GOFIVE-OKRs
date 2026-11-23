import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { useLanguage } from './hooks/useLanguage.js';

export function App() {
  const { lang, toggleLanguage, t } = useLanguage('en');

  return (
    <BrowserRouter>
      <AppShell t={t} lang={lang} onToggleLanguage={toggleLanguage}>
        <Routes>
          <Route path="*" element={<HomePage t={t} />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
