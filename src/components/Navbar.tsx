import {useState} from 'react';
import {Menu, X} from 'lucide-react';

interface NavbarProps {
  ctaLabel: string;
  onCtaClick: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

const NAV_LINKS = [
  {label: 'Destinations', href: '#destinations', sectionId: 'destinations'},
  {label: 'Businesses', href: '#businesses', sectionId: 'businesses'},
  {label: 'Map', href: '#explore-map', sectionId: 'explore-map'},
  {label: 'Stays & Dining', href: '#stays-dining', sectionId: 'stays-dining'},
  {label: 'AI Guide', href: '#ai-assistant', sectionId: 'ai-assistant'},
  {label: 'Reviews', href: '#reviews', sectionId: 'reviews'},
];

export function Navbar({ctaLabel, onCtaClick, onNavigateSection}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    setMobileOpen(false);
    if (onNavigateSection) {
      e.preventDefault();
      onNavigateSection(sectionId);
    }
  };

  const handleMobileAction = () => {
    setMobileOpen(false);
    onCtaClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#E7DEC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, 'top')}
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#133828] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#133828]"
        >
          Swadesh Trails
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2E3F35]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.sectionId)}
              className="relative py-1 whitespace-nowrap shrink-0 hover:text-[#133828] transition-colors duration-150 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1.5px] after:bg-[#B88B3A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#133828]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action + mobile drawer toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCtaClick}
            className="hidden md:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88B3A]"
          >
            {ctaLabel}
          </button>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#133828] hover:bg-[#F3EDE2] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7DEC9] bg-[#FAF8F4] px-4 py-4 space-y-2">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.sectionId)}
                className="px-3 py-3 text-base font-medium text-[#17261E] hover:bg-[#F3EDE2] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-[#E7DEC9]">
            <button
              type="button"
              onClick={handleMobileAction}
              className="w-full py-3 px-4 text-sm font-medium text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
