"use client";

import HeroContent from "../sub/HeroContent";

export default function Hero({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return <HeroContent onNavigate={onNavigate} />;
}
