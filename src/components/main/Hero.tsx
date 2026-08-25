"use client";

import HeroContent from "../sub/HeroContent";
import type { SiteData } from "@/lib/db/queries";

export default function Hero({
  data,
  onNavigate,
}: {
  data: SiteData;
  onNavigate?: (id: string) => void;
}) {
  return <HeroContent data={data} onNavigate={onNavigate} />;
}
