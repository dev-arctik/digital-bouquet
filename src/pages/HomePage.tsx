// Landing page — romantic hero with scattered flower illustrations,
// large calligraphic logo, warm tagline, and rose-toned CTAs.
// "My Collection" button only appears when the garden has saved bouquets.

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectGardenIsEmpty } from '../features/garden/gardenSlice';

// Decorative flower images for the landing page background
import roseImg from '../assets/flowers/rose.png';
import tulipImg from '../assets/flowers/tulip.png';
import peonyImg from '../assets/flowers/peony.png';
import daisyImg from '../assets/flowers/daisy.png';
import orchidImg from '../assets/flowers/orchid.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const gardenIsEmpty = useAppSelector(selectGardenIsEmpty);

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh] text-center px-6 gap-8">
      {/* Scattered decorative flowers — floating animation, low opacity, behind content */}
      <img
        src={roseImg}
        alt=""
        aria-hidden="true"
        className="absolute top-[8%] left-[5%] w-28 opacity-40 animate-float pointer-events-none select-none"
      />
      <img
        src={tulipImg}
        alt=""
        aria-hidden="true"
        className="absolute top-[15%] right-[8%] w-24 opacity-35 animate-float-delayed pointer-events-none select-none -rotate-12"
      />
      <img
        src={peonyImg}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[12%] left-[8%] w-32 opacity-40 animate-float-slow pointer-events-none select-none rotate-6"
      />
      <img
        src={daisyImg}
        alt=""
        aria-hidden="true"
        className="absolute bottom-[20%] right-[5%] w-24 opacity-35 animate-float pointer-events-none select-none"
      />
      <img
        src={orchidImg}
        alt=""
        aria-hidden="true"
        className="absolute top-[45%] left-[2%] w-20 opacity-25 animate-float-delayed pointer-events-none select-none rotate-12"
      />

      {/* Logo — dramatic, large, romantic calligraphic font */}
      <h1 className="font-logo text-8xl sm:text-9xl z-10 animate-fade-in-up">
        DigiBouquet
      </h1>

      {/* Tagline — warm, emotional, in DM Sans for a softer feel */}
      <p
        className="font-note text-lg sm:text-xl text-rose-dark max-w-lg z-10 animate-fade-in-up leading-relaxed"
        style={{ animationDelay: '0.15s' }}
      >
        Handpick flowers, arrange them with love, and share a beautiful bouquet
        with someone special.
      </p>

      {/* CTA buttons — warm rose tones, rounded, inviting */}
      <div
        className="flex flex-col items-center gap-4 mt-2 z-10 animate-fade-in-up"
        style={{ animationDelay: '0.3s' }}
      >
        <button
          onClick={() => navigate('/build/pick')}
          aria-label="Start creating your bouquet"
          className="px-10 py-4 bg-rose text-white text-sm font-note font-semibold rounded-lg hover:bg-rose-dark hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          Start Creating
        </button>

        {/* Only visible when garden has at least 1 bouquet */}
        {!gardenIsEmpty && (
          <button
            onClick={() => navigate('/garden')}
            aria-label="View my collection"
            className="px-10 py-4 border-2 border-rose text-rose text-sm font-note font-semibold rounded-lg hover:bg-rose-light transition-all duration-300"
          >
            My Collection
          </button>
        )}
      </div>

      {/* Subtle footer hint — reduces friction for new visitors */}
      <p
        className="text-xs text-subtitle z-10 mt-8 animate-fade-in-up font-note"
        style={{ animationDelay: '0.45s' }}
      >
        No account needed — create, share, and save for free
      </p>
    </div>
  );
};

export default HomePage;
