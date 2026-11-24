import {Mail, MapPin, Phone} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0C2419] text-[#E7DEC9] border-t border-[#1B4A35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1B4A35]">
          <div className="lg:col-span-4 space-y-4">
            <a href="#top" className="font-display text-2xl font-semibold text-white">
              Swadesh Trails
            </a>
            <p className="text-sm text-[#D5C8AD]/85 leading-relaxed max-w-sm">
              India Smart Local Tourism &amp; Business Portal connecting responsible travelers
              with regional landscapes, village artisan cooperatives, heritage homestays, and
              licensed Indian guides.
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#D5C8AD]">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E2C583]" />
                <span>Community Tourism Desk, Indiranagar, Bengaluru · India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E2C583]" />
                <span className="tabular-nums">+91 80 4120 5890 (08:00 – 20:00 IST)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E2C583]" />
                <span>namaste@swadeshtrails.in</span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 lg:col-start-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E2C583]">
              Explore India
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#destinations" className="hover:text-white transition-colors">
                  Destinations &amp; Trails
                </a>
              </li>
              <li>
                <a href="#businesses" className="hover:text-white transition-colors">
                  Artisans &amp; Guides
                </a>
              </li>
              <li>
                <a href="#stays-dining" className="hover:text-white transition-colors">
                  Havelis &amp; Homestays
                </a>
              </li>
              <li>
                <a href="#stays-dining" className="hover:text-white transition-colors">
                  Regional Kitchens
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E2C583]">
              Traveler Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#ai-assistant" className="hover:text-white transition-colors">
                  AI Tourism Concierge
                </a>
              </li>
              <li>
                <a href="#businesses" className="hover:text-white transition-colors">
                  Book Licensed Guides
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Verified Traveler Reviews
                </a>
              </li>
              <li>
                <a href="#top" className="hover:text-white transition-colors">
                  Monsoon &amp; Trail Advisories
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E2C583]">
              Responsible Charter
            </h3>
            <p className="text-xs text-[#D5C8AD]/80 leading-relaxed">
              Plastic-free forest trail pledge, zero-middleman rural cooperative pricing, and
              regional architectural preservation.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D5C8AD]/70">
          <p>© 2026 Swadesh Trails — India Smart Local Tourism &amp; Business Portal.</p>
          <p>Sustainable Indian Travel · Direct Local Commerce</p>
        </div>
      </div>
    </footer>
  );
}
