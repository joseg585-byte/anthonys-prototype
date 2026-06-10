"use client";

import Image from "next/image";
import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** extra object-position, etc. on the <img> */
  imgClassName?: string;
}

// next/image with a graceful warm blur-up: a shimmer placeholder holds the
// space, then the photo fades + settles in. Parent must be positioned with a
// defined aspect ratio. Every photo also gets the unified `photo-treat` look.
export function SmartImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className = "",
  imgClassName = "",
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`absolute inset-0 block overflow-hidden ${className}`}>
      {!loaded && <span aria-hidden className="blur-load absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`object-cover photo-treat transition-all duration-700 ease-out ${
          loaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
        } ${imgClassName}`}
      />
    </span>
  );
}
