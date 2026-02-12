// App — top-level routing configuration.
// All routes are wrapped in the Layout shell and ErrorBoundary for crash recovery.
// Builder steps have distinct URLs: /build/pick, /build/arrange, /build/preview.

import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import ViewerPage from './pages/ViewerPage';
import GardenPage from './pages/GardenPage';
import AboutPage from './pages/AboutPage';
import { Step1 } from './features/builder/Step1';
import { Step2 } from './features/builder/Step2';
import { Step3 } from './features/builder/Step3';

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <HomePage />
            </ErrorBoundary>
          }
        />

        {/* Builder wizard — each step has its own URL */}
        <Route
          path="/build"
          element={
            <ErrorBoundary>
              <BuilderPage />
            </ErrorBoundary>
          }
        >
          <Route index element={<Navigate to="pick" replace />} />
          <Route path="pick" element={<Step1 />} />
          <Route path="arrange" element={<Step2 />} />
          <Route path="preview" element={<Step3 />} />
        </Route>

        <Route
          path="/garden"
          element={
            <ErrorBoundary>
              <GardenPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/view"
          element={
            <ErrorBoundary>
              <ViewerPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/about"
          element={
            <ErrorBoundary>
              <AboutPage />
            </ErrorBoundary>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
