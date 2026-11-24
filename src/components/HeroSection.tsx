import {ArrowRight, Compass} from 'lucide-react';
import {motion} from 'motion/react';
import {HERO_IMAGE} from '../data/portalData';
import {PortalImage} from './PortalImage';

interface HeroSectionProps {
  onExploreClick: () => void;
  onAiClick: () => void;
}

const VALLEY_HIGHLIGHTS = [
  {value: '06', label: 'Curated Indian Eco & Heritage Sites'},
  {value: '18+', label: 'Verified Local Artisans & Guides'},
  {value: '12', label: 'Havelis, Homestays & Regional Kitchens'},
  {value: '4.9 ★', label: 'Traveler Community Rating'},
];

export function HeroSection({onExploreClick, onAiClick}: HeroSectionProps) {
  return (
    <section id="top" className="relative bg-[#FAF8F4]">
      {/* Full-width 16:9 atmospheric hero showcase */}
      <div className="relative min-h-[540px] lg:min-h-[640px] flex items-end overflow-hidden">
        <PortalImage
          src={HERO_IMAGE}
          alt="Misty Western Ghats and Himalayan stone trail overlooking terraced green hills in India"
          title="Swadesh Trails — India"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Measured contrast scrim ensuring >= 4.5:1 legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0C2419]/90 via-[#0C2419]/50 to-[#0C2419]/20"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <motion.div
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
            className="max-w-2xl"
          >
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#E2C583] mb-3">
              India Local Tourism Portal · Western Ghats, Rajasthan &amp; Northeast
            </p>

            <h1
              className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold text-white leading-[1.08] tracking-tight mb-5"
              style={{textWrap: 'balance'}}
            >
              Discover India&apos;s living heritage &amp; local trails.
            </h1>

            <p className="text-base sm:text-lg text-[#F3EDE2]/90 leading-relaxed max-w-xl mb-8">
              Connect directly with monsoon waterfalls in Kodagu, Mewar hill citadels, Khasi
              cloud ridges, Tharavadu courtyard homestays, spice cooperatives, and certified
              Indian guides.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#0C2419] bg-[#E2C583] hover:bg-[#CFA957] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Explore Destinations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onAiClick}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:text-[#E2C583] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2C583]"
              >
                <Compass className="w-4 h-4 text-[#E2C583]" />
                <span className="underline underline-offset-4 decoration-[#E2C583]/60">
                  Ask AI Travel Concierge
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4-Column Regional Overview Strip below Hero */}
      <div className="bg-[#F3EDE2] border-b border-[#E7DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#D5C8AD]">
            {VALLEY_HIGHLIGHTS.map((stat) => (
              <div key={stat.label} className="py-5 px-4 sm:px-6 first:pl-0">
                <div className="font-display text-2xl sm:text-3xl font-semibold text-[#133828] tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#495A50] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
