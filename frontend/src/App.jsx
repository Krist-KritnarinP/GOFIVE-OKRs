import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AppShell } from './components/layout/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { useLanguage } from './hooks/useLanguage.js';

export function App() {
  const { lang, toggleLanguage, t } = useLanguage('en');

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppShell t={t} lang={lang} onToggleLanguage={toggleLanguage}>
          <Routes>
            <Route path="*" element={<HomePage t={t} />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
