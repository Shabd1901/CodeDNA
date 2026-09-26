"use client";

import React from "react";

interface CodeDNALogoProps {
  /** Size of the logo square in pixels. Default: 24 */
  size?: number;
  /** Extra className on the wrapper div */
  className?: string;
  /** If true, renders just the raw SVG without any background container */
  bare?: boolean;
}

/**
 * Global CodeDNA brand logo — a stylised DNA double-helix rendered as a compact
 * SVG. Used in the main header, sidebar context bar, print headers, and favicon.
 *
 * Use `bare` to render the SVG icon alone (no background wrapper).
 * Default usage renders inside the standard zinc-900 pill container.
 */
export function CodeDNALogo({ size = 24, className = "", bare = false }: CodeDNALogoProps) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CodeDNA Logo"
    >
      {/* Left strand of helix */}
      <path
        d="M6 2 C6 6 10 8 10 12 C10 16 6 18 6 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right strand of helix */}
      <path
        d="M18 2 C18 6 14 8 14 12 C14 16 18 18 18 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Rungs / base pairs */}
      <line x1="7.5" y1="5.5"  x2="16.5" y2="5.5"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.5" y1="9.2"  x2="14.5" y2="9.2"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.5" y1="14.8" x2="14.5" y2="14.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7.5" y1="18.5" x2="16.5" y2="18.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* Accent dots at rung junctions (forensic nodes) */}
      <circle cx="7.5"  cy="5.5"  r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="5.5"  r="1.2" fill="currentColor" />
      <circle cx="9.5"  cy="9.2"  r="1"   fill="currentColor" />
      <circle cx="14.5" cy="9.2"  r="1"   fill="currentColor" />
      <circle cx="9.5"  cy="14.8" r="1"   fill="currentColor" />
      <circle cx="14.5" cy="14.8" r="1"   fill="currentColor" />
      <circle cx="7.5"  cy="18.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="18.5" r="1.2" fill="currentColor" />
    </svg>
  );

  if (bare) return svg;

  return (
    <div
      className={`inline-flex items-center justify-center p-2.5 bg-zinc-900 text-white rounded-xl shadow-sm shrink-0 ${className}`}
      style={{ width: size + 20, height: size + 20 }}
    >
      {svg}
    </div>
  );
}
