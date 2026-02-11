// App shell with navbar. Wraps all routes via Outlet.
// "DigiBouquet" logo on the left (Pinyon Script, links to /).
// Garden icon on the right (links to /garden, only shown if garden has bouquets).

import { Outlet, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectGardenIsEmpty } from '../features/garden/gardenSlice';

export const Layout: React.FC = () => {
  const gardenIsEmpty = useAppSelector(selectGardenIsEmpty);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar — warm rose-light border + subtle shadow for depth */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-rose-light shadow-sm">
        <Link to="/" className="font-logo text-4xl text-rose-dark no-underline">
          DigiBouquet
        </Link>

        {/* Garden link — only visible when garden has bouquets */}
        {!gardenIsEmpty && (
          <Link
            to="/garden"
            className="uppercase tracking-widest text-xs font-mono text-rose no-underline border-2 border-rose px-3 py-1.5 rounded-lg hover:bg-rose-light transition-colors"
            aria-label="My Garden"
          >
            My Garden
          </Link>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
