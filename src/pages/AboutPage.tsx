// About page — credits the creator with a detailed bio, links to
// GitHub and LinkedIn, explains why this project exists, and
// acknowledges the original inspiration.

import { Link } from 'react-router-dom';
import { Github, Linkedin, ExternalLink } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center text-center px-6 py-10 gap-5 animate-fade-in-up overflow-y-auto">
      {/* Calligraphic heading */}
      <h1 className="font-logo text-4xl sm:text-5xl text-rose-dark">About Me</h1>
      <p className="font-note text-base text-subtitle -mt-2">
        The creator behind DigiBouquet
      </p>

      {/* GitHub avatar — circular with rose border accent */}
      <img
        src="https://github.com/dev-arctik.png"
        alt="Devansh Raj's GitHub avatar"
        className="w-28 h-28 rounded-full border-4 border-rose shadow-md"
      />

      {/* Name and handle */}
      <div className="-mt-1">
        <p className="font-note text-lg font-semibold text-rose-dark">
          Devansh Raj
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-subtitle">
          dev-arctik
        </p>
      </div>

      {/* Bio — who I am */}
      <div className="max-w-2xl space-y-3">
        <p className="font-note text-sm sm:text-base text-subtitle leading-relaxed">
          I&apos;m a developer from Vadodara, India, currently working as an{' '}
          <span className="font-semibold text-rose-dark">AI Agent Developer</span>.
          My days revolve around building intelligent agents with LangChain,
          LangGraph, and Agno — teaching machines to reason, plan, and act.
        </p>
        {/* Why I built this */}
        <p className="font-note text-sm sm:text-base text-subtitle leading-relaxed">
          I built DigiBouquet as a creative side project — something warm and
          personal in a world of dashboards and data pipelines. No accounts,
          no backend, just flowers. Pick them, arrange them, write a note,
          and share the link with someone who matters. It&apos;s the kind of
          project that reminds me why I started coding in the first place.
        </p>

        {/* Acknowledgement — brief */}
        <p className="font-note text-xs sm:text-sm text-subtitle/70 leading-relaxed italic">
          Inspired by{' '}
          <a
            href="https://digibouquet.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose hover:text-rose-dark underline transition-colors"
          >
            digibouquet.vercel.app
          </a>
          {' '}— reimagined with drag-and-drop, image export, and a personal garden.
        </p>
      </div>

      {/* CTA buttons — GitHub, LinkedIn, Repos */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
        <a
          href="https://github.com/dev-arctik"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-rose text-white text-xs uppercase tracking-widest font-semibold font-note rounded-lg hover:bg-rose-dark hover:shadow-lg transition-all duration-300"
        >
          <Github size={14} className="inline -mt-0.5" /> Follow on GitHub
        </a>
        <a
          href="https://in.linkedin.com/in/devanshraj"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-[#0A66C2] text-white text-xs uppercase tracking-widest font-semibold font-note rounded-lg hover:bg-[#004182] hover:shadow-lg transition-all duration-300"
        >
          <Linkedin size={14} className="inline -mt-0.5" /> Connect on LinkedIn
        </a>
        <a
          href="https://github.com/dev-arctik?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border-2 border-rose text-rose text-xs uppercase tracking-widest font-semibold font-note rounded-lg hover:bg-rose-light transition-all duration-300"
        >
          <ExternalLink size={14} className="inline -mt-0.5" /> Explore my Repos
        </a>
      </div>

      {/* Back to home — tertiary link */}
      <Link
        to="/"
        className="text-subtitle text-xs uppercase tracking-wider font-semibold font-note hover:text-rose-dark transition-colors mt-2 pb-4"
      >
        &larr; Back to Home
      </Link>
    </div>
  );
};

export default AboutPage;
