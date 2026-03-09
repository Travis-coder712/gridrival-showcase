import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ---- Types ----

interface GuideLink {
  emoji: string;
  title: string;
  description: string;
  href: string;
  isExternal: boolean;
}

interface SectionConfig {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;      // Tailwind color name (electric, amber, lime, purple)
  bgTint: string;           // Background tint class
  borderAccent: string;     // Left border accent
  iconGlow: string;         // Glow behind the section icon
  dividerGradient: string;  // Gradient for the divider line
  cardBorder: string;       // Card border color
  cardHoverBorder: string;  // Card hover border
  cardHoverBg: string;      // Card hover bg
  cardTitleColor: string;   // Card title text color
  watermarkIcon: string;    // Large faded watermark icon
  guides: GuideLink[];
}

// ---- Data ----

const sections: SectionConfig[] = [
  {
    id: 'player',
    icon: '📖',
    title: 'Player Guides',
    subtitle: 'Educational content for participants — distribute before, during, or after the session',
    accentColor: 'electric',
    bgTint: 'bg-electric-500/[0.03]',
    borderAccent: 'border-electric-500/40',
    iconGlow: 'shadow-electric-500/30',
    dividerGradient: 'from-electric-500/40 via-electric-500/10 to-transparent',
    cardBorder: 'border-electric-500/20',
    cardHoverBorder: 'hover:border-electric-400/50',
    cardHoverBg: 'hover:bg-electric-500/10',
    cardTitleColor: 'text-electric-300',
    watermarkIcon: '📚',
    guides: [
      {
        emoji: '📖',
        title: 'Player Pre-Read',
        description: 'Send to participants before the session. Covers the NEM, merit order, generator types, bidding strategies, scenarios, and glossary.',
        href: '/api/pre-read',
        isExternal: true,
      },
      {
        emoji: '📄',
        title: 'Quick Reference Guide',
        description: 'Printable reference with asset specs, bidding rules, strategies, annotated walkthrough, time periods, and guardrails.',
        href: '/guide',
        isExternal: false,
      },
      {
        emoji: '🎓',
        title: 'Educational Compendium',
        description: 'Post-game take-home reference — NEM basics, generator types, strategies, scenarios, the energy transition, and real NEM data.',
        href: '/api/educational-compendium',
        isExternal: true,
      },
    ],
  },
  {
    id: 'host',
    icon: '🎯',
    title: 'Host / Game Master',
    subtitle: 'Facilitation guides with round-by-round walkthroughs, teaching notes, and detailed mechanics',
    accentColor: 'amber',
    bgTint: 'bg-amber-500/[0.03]',
    borderAccent: 'border-amber-500/40',
    iconGlow: 'shadow-amber-500/30',
    dividerGradient: 'from-amber-500/40 via-amber-500/10 to-transparent',
    cardBorder: 'border-amber-500/20',
    cardHoverBorder: 'hover:border-amber-400/50',
    cardHoverBg: 'hover:bg-amber-500/10',
    cardTitleColor: 'text-amber-300',
    watermarkIcon: '🏆',
    guides: [
      {
        emoji: '🎯',
        title: "Game Master's Guide",
        description: 'Everything you need to run a great session — round-by-round walkthroughs for all 6 game modes, facilitation techniques, and tips.',
        href: '/api/game-master-guide',
        isExternal: true,
      },
      {
        emoji: '🎮',
        title: 'Gameplay Mechanics',
        description: 'Behind-the-scenes reference — merit order dispatch, pricing, profit formulas, battery/hydro mechanics, and round configurations.',
        href: '/api/gameplay-summary',
        isExternal: true,
      },
      {
        emoji: '💡',
        title: 'Enhancement Concepts',
        description: 'Design concepts for NPC market participants and a 10-year Energy Transition game mode with retail, hedging, and investment mechanics.',
        href: '/api/enhancement-concepts',
        isExternal: true,
      },
    ],
  },
  {
    id: 'tools',
    icon: '🛠',
    title: 'Tools & Extras',
    subtitle: 'Interactive tools and media to enhance your session',
    accentColor: 'lime',
    bgTint: 'bg-lime-500/[0.02]',
    borderAccent: 'border-lime-400/40',
    iconGlow: 'shadow-lime-500/30',
    dividerGradient: 'from-lime-400/40 via-lime-400/10 to-transparent',
    cardBorder: 'border-lime-500/20',
    cardHoverBorder: 'hover:border-lime-400/50',
    cardHoverBg: 'hover:bg-lime-500/10',
    cardTitleColor: 'text-lime-300',
    watermarkIcon: '⚡',
    guides: [
      {
        emoji: '🎬',
        title: 'Watch Trailer',
        description: 'Cinematic trailer introducing GridRival — great for building excitement before a session.',
        href: '/api/trailer',
        isExternal: false,
      },
      {
        emoji: '🔋',
        title: 'Battery Mini-Game',
        description: 'Standalone battery arbitrage practice — charge and discharge across a 24-hour price curve.',
        href: '/battery-test',
        isExternal: false,
      },
      {
        emoji: '📊',
        title: 'Battery Forecast Challenge',
        description: 'Bid a real NEM battery against AEMO pre-dispatch forecasts. Compare your strategy to what Torrens Island Battery actually did.',
        href: '/battery-forecast',
        isExternal: false,
      },
      {
        emoji: '🏪',
        title: 'Retail Mini-Game',
        description: 'Customer acquisition & retention challenge, plus a vertical integration scenario showing the gen/retail balance.',
        href: '/retail-minigame',
        isExternal: false,
      },
      {
        emoji: '🛡️',
        title: 'Hedging Mini-Game',
        description: 'Build a hedge portfolio with caps and swaps to protect your retail book against wholesale price risk.',
        href: '/hedging-minigame',
        isExternal: false,
      },
      {
        emoji: '🏗️',
        title: 'Investment Mini-Game',
        description: 'Replace retiring coal capacity — choose between Build Ready and R&D projects within a budget.',
        href: '/investment-minigame',
        isExternal: false,
      },
      {
        emoji: '⚡',
        title: 'Energy Transition Simulator',
        description: 'Explore how solar, wind, batteries and gas combine to replace coal — interactive portfolio modelling with real NEM data.',
        href: '/energy-mix',
        isExternal: false,
      },
      {
        emoji: '🔌',
        title: 'Transmission Education Piece',
        description: 'How electricity gets from generators to consumers — REZs, interconnectors, curtailment types, and the infrastructure shaping Australia\'s energy transition.',
        href: '/api/transmission-education',
        isExternal: true,
      },
    ],
  },
  {
    id: 'dev',
    icon: '💻',
    title: 'Development & Technical',
    subtitle: 'How the game was built, architecture notes, and improvement roadmap',
    accentColor: 'purple',
    bgTint: 'bg-purple-500/[0.03]',
    borderAccent: 'border-purple-500/40',
    iconGlow: 'shadow-purple-500/30',
    dividerGradient: 'from-purple-500/40 via-purple-500/10 to-transparent',
    cardBorder: 'border-purple-500/20',
    cardHoverBorder: 'hover:border-purple-400/50',
    cardHoverBg: 'hover:bg-purple-500/10',
    cardTitleColor: 'text-purple-300',
    watermarkIcon: '🔧',
    guides: [
      {
        emoji: '✨',
        title: 'How This Was Built (Vibe Coding)',
        description: 'A non-technical guide explaining how the game was built using AI-assisted "vibe coding" with Claude Code.',
        href: '/api/notes/vibe-coding',
        isExternal: true,
      },
      {
        emoji: '🔧',
        title: 'Technical Notes (IT Teams)',
        description: 'Architecture overview, tech stack, deployment instructions, and infrastructure notes for IT teams.',
        href: '/api/notes/technical',
        isExternal: true,
      },
      {
        emoji: '🚀',
        title: 'Recommended Improvements',
        description: 'Categorised roadmap of potential enhancements — IT/infrastructure, UX, and gameplay improvements.',
        href: '/api/recommended-improvements',
        isExternal: true,
      },
    ],
  },
];

// ---- SVG Background Pattern ----

const GRID_PATTERN_SVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2347a7ff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

// ---- Components ----

function GuideCard({
  guide,
  section,
  featured = false,
}: {
  guide: GuideLink;
  section: SectionConfig;
  featured?: boolean;
}) {
  const navigate = useNavigate();

  const cardClasses = `
    block ${featured ? 'w-full' : 'w-full'} text-left
    border ${section.cardBorder} ${section.cardHoverBorder} ${section.cardHoverBg}
    bg-white/[0.03] rounded-xl ${featured ? 'p-5' : 'p-4'}
    transition-all duration-200 group cursor-pointer
    hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]
  `.trim();

  const inner = (
    <div className={`flex items-start gap-4 ${featured ? 'md:items-center' : ''}`}>
      {/* Emoji in colored circle */}
      <div className={`
        flex-shrink-0 flex items-center justify-center
        ${featured ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-2xl'}
        rounded-xl bg-white/[0.06] border border-white/[0.08]
        group-hover:bg-white/10 transition-colors
      `}>
        {guide.emoji}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className={`font-bold ${featured ? 'text-base' : 'text-sm'} ${section.cardTitleColor} group-hover:underline underline-offset-2`}>
          {guide.title}
        </div>
        <div className={`text-xs text-navy-400 ${featured ? 'mt-1.5' : 'mt-1'} leading-relaxed`}>
          {guide.description}
        </div>
      </div>
      {/* Arrow */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-navy-500 mt-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );

  if (guide.isExternal || guide.href.startsWith('/api/')) {
    // Prepend base URL for static pages on GitHub Pages
    const fullHref = guide.href.startsWith('/api/')
      ? `${import.meta.env.BASE_URL}${guide.href.slice(1)}`
      : guide.href;
    return (
      <a href={fullHref} target="_blank" rel="noopener noreferrer" className={cardClasses}>
        {inner}
      </a>
    );
  }

  return (
    <button onClick={() => navigate(guide.href)} className={cardClasses}>
      {inner}
    </button>
  );
}

function Section({
  config,
  index,
}: {
  config: SectionConfig;
  index: number;
}) {
  const guides = config.guides;
  const hasFeatured = guides.length === 3; // 3-card sections get a featured first card

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.45 }}
    >
      <div className={`relative ${config.bgTint} rounded-2xl border-l-4 ${config.borderAccent} overflow-hidden`}>
        {/* Watermark icon */}
        <div className="absolute top-3 right-4 text-6xl opacity-[0.04] pointer-events-none select-none">
          {config.watermarkIcon}
        </div>

        <div className="relative z-[1] px-5 py-5 md:px-6">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-1">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-xl
              bg-white/[0.06] border border-white/[0.08]
              shadow-lg ${config.iconGlow}
            `}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{config.title}</h2>
              <p className="text-[11px] text-navy-400 leading-snug">{config.subtitle}</p>
            </div>
          </div>

          {/* Gradient divider */}
          <div className={`h-px bg-gradient-to-r ${config.dividerGradient} mt-3 mb-4`} />

          {/* Cards */}
          {hasFeatured ? (
            <div className="space-y-3">
              {/* Featured first card */}
              <GuideCard guide={guides[0]} section={config} featured />
              {/* Remaining 2 cards side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guides.slice(1).map((g) => (
                  <GuideCard key={g.title} guide={g} section={config} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guides.map((g) => (
                <GuideCard key={g.title} guide={g} section={config} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---- Page ----

export default function GuidesPage() {
  const navigate = useNavigate();

  const totalGuides = sections.reduce((sum, s) => sum + s.guides.length, 0);

  return (
    <div className="min-h-screen bg-navy-950 text-white relative">
      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none z-0"
        style={{ backgroundImage: GRID_PATTERN_SVG }}
      />

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-navy-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-electric-400 hover:text-electric-300 text-sm font-medium transition-colors"
          >
            &larr; Back to Home
          </button>
          <span className="text-navy-400 text-xs">GridRival Guides &amp; Resources</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[1] max-w-3xl mx-auto px-4 pt-8 pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          {/* Icon with glow */}
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-full bg-electric-500/20 blur-xl scale-150" />
            <div className="relative text-5xl glow-pulse">&#9889;</div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Guides &amp; Background
          </h1>
          <p className="text-navy-300 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            Everything you need to prepare for, run, and understand GridRival &mdash;
            from player pre-reads to technical documentation.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-[11px] text-navy-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-500/60" />
              {totalGuides} guides &amp; tools
            </span>
            <span className="text-[11px] text-navy-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              {sections.length} categories
            </span>
            <span className="text-[11px] text-navy-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500/60" />
              6 game modes
            </span>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, i) => (
            <Section key={section.id} config={section} index={i} />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-12 pt-6 border-t border-white/[0.06]"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-navy-500">
              <span className="text-xs">&#9889;</span>
              <span className="text-xs font-medium tracking-wide">GRIDRIVAL</span>
              <span className="text-xs">&#9889;</span>
            </div>
            <p className="text-navy-600 text-[10px] tracking-wider">
              6 game modes &bull; 7 asset types &bull; 6 bidding strategies &bull; Real NEM scenarios
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
