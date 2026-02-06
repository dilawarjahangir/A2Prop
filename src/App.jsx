import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import routes from './routes';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PageLoader from './components/PageLoader.jsx';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import LocaleRoot from './components/system/LocaleRoot.jsx';

const ScrollToTop = ({ lenisRef }) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;

    const lenis = lenisRef?.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [hash, lenisRef, pathname]);

  return null;
};

const generateRoutes = (prefix = '', routeGroup = {}) =>
  Object.entries(routeGroup).map(([path, Component]) => (
    <Route key={`${prefix}${path}`} path={`${prefix}${path}`} element={<Component />} />
  ));


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const lenisRef = useSmoothScroll();

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <LocaleRoot>
      <div className="">
        {isLoading && <PageLoader onComplete={handleLoaderComplete} />}
        <Router>
          <ScrollToTop lenisRef={lenisRef} />
          <Routes>
            {routes.map(({ prefix, routes }) => generateRoutes(prefix, routes))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </div>
    </LocaleRoot>
  );
}

export default App;
