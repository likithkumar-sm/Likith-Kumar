import {useState} from 'react';
import {Mountain} from 'lucide-react';

interface PortalImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function PortalImage({src, alt, title, className = ''}: PortalImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E7DEC9] via-[#F3EDE2] to-[#D5C8AD] text-[#133828] p-6 text-center ${className}`}
      >
        <Mountain className="w-8 h-8 text-[#256146] mb-2 opacity-80" strokeWidth={1.5} />
        <span className="font-display text-sm font-semibold tracking-tight text-[#133828]">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
