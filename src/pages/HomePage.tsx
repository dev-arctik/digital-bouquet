// Landing page — romantic hero with scattered flower illustrations,
// large calligraphic logo, warm tagline, and rose-toned CTAs.
// "My Collection" button only appears when the garden has saved bouquets.

import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen } from 'lucide-react';
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
    <div className="relative overflow-hidden flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
      {/* Scattered decorative flowers — hidden on mobile to avoid overlapping CTA buttons */}
      <img
        src={roseImg}
        alt=""
        aria-hidden="true"
        className="hidden sm:block absolute top-[8%] left-[5%] w-28 opacity-40 animate-float pointer-events-none select-none"
      />
      <img
        src={tulipImg}
        alt=""
        aria-hidden="true"
        className="hidden sm:block absolute top-[15%] right-[8%] w-24 opacity-35 animate-float-delayed pointer-events-none select-none -rotate-12"
      />
      <img
        src={peonyImg}
        alt=""
        aria-hidden="true"
        className="hidden sm:block absolute bottom-[12%] left-[8%] w-32 opacity-40 animate-float-slow pointer-events-none select-none rotate-6"
      />
      <img
        src={daisyImg}
        alt=""
        aria-hidden="true"
        className="hidden sm:block absolute bottom-[20%] right-[5%] w-24 opacity-35 animate-float pointer-events-none select-none"
      />
      <img
        src={orchidImg}
        alt=""
        aria-hidden="true"
        className="hidden sm:block absolute top-[45%] left-[2%] w-20 opacity-25 animate-float-delayed pointer-events-none select-none rotate-12"
      />

      {/* Logo — responsive sizing so it doesn't overflow on mobile */}
      <h1 className="font-note text-5xl sm:text-7xl md:text-8xl lg:text-9xl z-10 animate-fade-in-up">
        DigiBouquet
      </h1>

      {/* Subtitle — explains what the app is at a glance */}
      <p
        className="text-subtitle font-note text-sm z-10 animate-fade-in-up -mt-4"
        style={{ animationDelay: '0.1s' }}
      >
        Your Digital Bouquet Maker
      </p>

      {/* Tagline — warm, emotional, in DM Sans for a softer feel */}
      <p
        className="font-note text-lg sm:text-xl text-rose-dark max-w-lg z-10 animate-fade-in-up leading-relaxed"
        style={{ animationDelay: '0.15s' }}
      >
        Handpick flowers, arrange them with love, and share a beautiful bouquet
        with someone special.
      </p>

      {/* Step preview flow — vertical on mobile, horizontal on larger screens */}
      <div
        className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 font-mono text-xs uppercase tracking-widest text-subtitle z-10 animate-fade-in-up"
        style={{ animationDelay: '0.22s' }}
      >
        <span>1. Pick Flowers</span>
        <span aria-hidden="true" className="hidden sm:inline">&rarr;</span>
        <span>2. Arrange a Bouquet</span>
        <span aria-hidden="true" className="hidden sm:inline">&rarr;</span>
        <span>3. Share the Link</span>
      </div>

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
          <Sparkles size={16} className="inline -mt-0.5" /> Start Creating
        </button>

        {/* Only visible when garden has at least 1 bouquet */}
        {!gardenIsEmpty && (
          <button
            onClick={() => navigate('/garden')}
            aria-label="View my collection"
            className="px-10 py-4 border-2 border-rose text-rose text-sm font-note font-semibold rounded-lg hover:bg-rose-light transition-all duration-300"
          >
            <BookOpen size={16} className="inline -mt-0.5" /> My Collection
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
