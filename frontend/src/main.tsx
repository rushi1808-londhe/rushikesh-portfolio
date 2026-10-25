import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { prefetchPortfolio } from './api/public';
import './index.css';

// Only the portfolio itself needs the full content; other pages load their own data.
if (window.location.pathname === '/') prefetchPortfolio();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
