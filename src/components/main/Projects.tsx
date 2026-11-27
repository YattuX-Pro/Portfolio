"use client";

import Image from "next/image";
import { useState } from "react";
import { HiArrowRight, HiArrowUpRight } from "react-icons/hi2";
import ProjectImage from "@/components/sub/ProjectImage";
import ProjectSheet from "@/components/sub/ProjectSheet";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { TechGlyph, guessIconSlug } from "@/lib/tech-icons";
import type { Project } from "@/lib/db/schema";

/* ── Projets ───────────────────────────────────────────────────────────────
   Le PREMIER projet publié (position la plus basse) est le projet phare : une
   affiche centrée sur ordinateur, la capture épinglée sur la carte au trésor,
   le sceau de la distinction sur son coin ; sur téléphone, la version mobile
   du site dans un téléphone posé sur la carte.

   Les suivants sont des vitrines, groupées par `kind` sous un intertitre :
   d'abord ce qui a été réalisé chez l'employeur, puis pour des clients, puis
   les autres projets personnels. Aucun nombre n'est écrit : on ajoute ou on
   retire un projet sans toucher au texte. */

const GROUPS: { kind: string; label: string }[] = [
  { kind: "employer", label: "Réalisés chez Netsen Group · pour des ministères guinéens" },
  { kind: "client", label: "Projets personnels · pour des clients" },
  { kind: "personal", label: "Autres projets personnels" },
];

/** « https://www.exemple.org/ » → « exemple.org ». */
function domainOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** « Libellé : valeur » → { label, value }. Sans « : », tout est la valeur. */
function splitFact(fact: string) {
  const i = fact.indexOf(":");
  return i === -1
    ? { label: "", value: fact.trim() }
    : { label: fact.slice(0, i).trim(), value: fact.slice(i + 1).trim() };
}

/* Le sceau de cire : la distinction sur deux lignes, le dernier mot en
   dessous (« 3e prix » / « ANSUTEN »), l'ordinal en exposant. */
function Seal({ award, className }: { award: string; className: string }) {
  const cut = award.lastIndexOf(" ");
  const head = cut > 0 ? award.slice(0, cut) : award;
  const tail = cut > 0 ? award.slice(cut + 1) : "";
  const m = head.match(/^(\d+)(e|er|ère|ème)\b(.*)$/);
  return (
    <p
      className={`absolute z-[3] m-0 flex -rotate-[10deg] flex-col items-center justify-center rounded-full bg-brand text-center text-brand-on shadow-[0_18px_30px_-12px_var(--shadow),inset_0_0_0_6px_var(--brand),inset_0_0_0_7px_rgb(255_255_255/0.55)] ${className}`}
    >
      <span className="whitespace-nowrap font-bold leading-none tracking-[-0.02em]">
        {m ? (
          <>
            {m[1]}
            <sup className="text-[0.55em] leading-none">{m[2]}</sup>
            {m[3]}
          </>
        ) : (
          head
        )}
      </span>
      {tail ? (
        <span className="mt-1.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] md:text-[10px]">
          {tail}
        </span>
      ) : null}
    </p>
  );
}

/* Le cadre de navigateur autour d'une capture : trois pastilles et le
   domaine. La capture reste nette : jamais affichée au-delà de sa taille. */
function BrowserFrame({ domain, children }: { domain: string | null; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_40px_80px_-40px_var(--shadow)]">
      <div aria-hidden className="flex h-9 items-center gap-1.5 border-b border-line bg-bg px-3.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        {domain ? (
          <span className="mx-auto flex h-[22px] items-center truncate rounded-full bg-surface px-3.5 font-mono text-[11px] text-ink-muted">
            {domain}
          </span>
        ) : null}
        <span className="w-10" />
      </div>
      {children}
    </div>
  );
}

function SiteButton({ href, variant }: { href: string; variant: "solid" | "outline" }) {
  const look =
    variant === "solid"
      ? "bg-brand text-brand-on hover:bg-brand-hover"
      : "border border-line-strong bg-surface text-ink hover:border-ink";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md px-5 text-[15px] font-medium transition-colors duration-200 ${look}`}
    >
      Voir le site
      <HiArrowUpRight size={15} aria-hidden />
    </a>
  );
}

function DetailButton({ label, title, onOpen }: { label: string; title: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/detail inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-line-strong px-5 text-[15px] font-medium text-ink transition-colors duration-200 hover:border-ink"
    >
      {label}
      <HiArrowRight size={15} aria-hidden className="transition-transform duration-200 group-hover/detail:translate-x-0.5" />
      <span className="sr-only">du projet {title}</span>
    </button>
  );
}

/* ── Le projet phare ─────────────────────────────────────────────────────── */
function Featured({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const domain = domainOf(p.demoUrl);
  const facts = p.facts.map(splitFact);
  const mobileShot = p.imageMobileUrl ?? p.imageUrl;

  const heading = (
    <>
      <p className="meta text-brand">Projet phare · {p.context ?? "produit personnel"}</p>
      <h3 className="mt-3.5 text-[52px] font-semibold leading-none tracking-[-0.04em] text-ink md:text-[clamp(64px,8vw,88px)]">
        {p.title}
        <span className="text-brand">.</span>
      </h3>
      <p className="mx-auto mt-3.5 max-w-[620px] text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-ink md:text-[20px]">
        {p.description}
      </p>
    </>
  );

  const actions = (
    <div className="mt-7 flex flex-col justify-center gap-2.5 md:flex-row md:gap-3">
      {p.demoUrl ? <SiteButton href={p.demoUrl} variant="solid" /> : null}
      <DetailButton label="Étude de cas" title={p.title} onOpen={onOpen} />
    </div>
  );

  return (
    <article>
      {/* ── Ordinateur ── */}
      <div className="hidden md:block">
        <Reveal className="text-center">
          {heading}
          {p.role ? <p className="meta mt-4">{p.role}</p> : null}
          {actions}
        </Reveal>

        <Reveal preset="scale" className="relative mx-auto mt-24 w-full max-w-[880px]">
          {/* La carte au trésor dépasse derrière le coin haut gauche. */}
          <Image
            src="/pirate/carte.png"
            alt=""
            width={720}
            height={480}
            sizes="340px"
            className="absolute -left-[17%] -top-[11%] z-0 h-auto w-[39%] -rotate-[7deg] drop-shadow-[0_18px_24px_var(--shadow)]"
          />
          <div className="relative z-[1]">
            <BrowserFrame domain={domain}>
              {p.imageUrl ? (
                <div className="relative aspect-[2000/1179] w-full">
                  <ProjectImage
                    src={p.imageUrl}
                    alt={`Page d'accueil de ${p.title}`}
                    blurDataURL={p.imageBlur}
                    sizes="880px"
                    className="object-top"
                  />
                </div>
              ) : null}
            </BrowserFrame>
          </div>
          {p.award ? (
            <Seal award={p.award} className="-right-12 -top-11 size-[116px] text-[24px]" />
          ) : null}
        </Reveal>

        {/* Légende puis repères, alignés sur la largeur du contenu. */}
        <div className="mt-10 flex items-baseline justify-between gap-6 border-b border-line pb-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          <span>{domain ? `${domain} · en production` : "En production"}</span>
          {p.stack.length > 0 ? <span>{p.stack.join(" · ")}</span> : null}
        </div>
        {facts.length > 0 ? (
          <dl className="grid grid-cols-3">
            {facts.slice(0, 3).map((f, i) => (
              <div key={f.label + f.value} className={`py-5 ${i === 0 ? "pr-6" : "border-l border-line-strong px-6"}`}>
                {f.label ? <dt className="meta">{f.label}</dt> : null}
                <dd className="mt-1.5 text-[15px] font-medium leading-[1.55] text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      {/* ── Téléphone : la version mobile du site, dans un téléphone posé sur
          la carte. La capture est affichée à moins de la moitié de sa taille
          d'origine : nette même en 3x. ── */}
      <div className="md:hidden">
        <Reveal className="text-center">{heading}</Reveal>
        <Reveal preset="scale" className="relative mt-7 h-[520px]">
          <Image
            src="/pirate/carte.png"
            alt=""
            width={720}
            height={480}
            sizes="340px"
            className="absolute left-1/2 top-[132px] h-auto w-[340px] max-w-none -translate-x-1/2 -rotate-[5deg] drop-shadow-[0_16px_22px_var(--shadow)]"
          />
          {mobileShot ? (
            <div className="absolute left-1/2 top-0 w-[236px] -translate-x-1/2 rounded-[40px] bg-ink p-[7px] shadow-[0_40px_70px_-30px_var(--shadow)]">
              <div className="relative aspect-[780/1580] overflow-hidden rounded-[33px] bg-surface">
                <ProjectImage
                  src={mobileShot}
                  alt={`${p.title} sur téléphone`}
                  blurDataURL={null}
                  sizes="236px"
                  className="object-top"
                />
              </div>
            </div>
          ) : null}
          {p.award ? <Seal award={p.award} className="right-3.5 top-[34px] size-[84px] text-[16px]" /> : null}
        </Reveal>
        {actions}
      </div>
    </article>
  );
}

/* ── Une vitrine ─────────────────────────────────────────────────────────── */
function Showcase({ p, num, flip, onOpen }: { p: Project; num: number; flip: boolean; onOpen: () => void }) {
  const lead = /lead/i.test(p.role ?? "");
  return (
    <li className="grid grid-cols-1 items-center gap-x-14 gap-y-7 border-b border-line py-9 md:grid-cols-2 md:py-14">
      <Reveal preset="scale" className={flip ? "md:order-2" : ""}>
        <BrowserFrame domain={domainOf(p.demoUrl)}>
          {p.imageUrl ? (
            <div className="relative aspect-[2000/1179] w-full">
              <ProjectImage
                src={p.imageUrl}
                alt={`Page d'accueil de ${p.title}`}
                blurDataURL={p.imageBlur}
                sizes="(max-width: 768px) 100vw, 540px"
                className="object-top"
              />
            </div>
          ) : (
            <p className="meta flex aspect-[2000/1179] items-center justify-center">Capture à venir</p>
          )}
        </BrowserFrame>
      </Reveal>

      <Reveal>
        <p className="meta">
          <span className="text-brand">{String(num).padStart(2, "0")}</span>
          {p.context ? (
            <>
              <span aria-hidden className="mx-2 text-line-strong">/</span>
              {p.context}
            </>
          ) : null}
        </p>
        <h3 className="mt-3 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[34px]">
          {p.title}
        </h3>
        {p.role ? (
          <p className="mt-3.5 flex items-center gap-2.5 text-[16px] font-semibold text-ink">
            <span aria-hidden className={`size-2.5 shrink-0 ${lead ? "bg-brand" : "bg-ink"}`} />
            {p.role}
          </p>
        ) : null}
        <p className="mt-3.5 text-[16px] leading-[1.7] text-ink-muted">{p.description}</p>
        {p.contribution ? <p className="mt-2.5 text-[16px] leading-[1.7] text-ink">{p.contribution}</p> : null}
        {p.stack.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Technologies de ${p.title}`}>
            {p.stack.map((tech) => (
              <li
                key={tech}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink"
              >
                <TechGlyph slug={guessIconSlug(tech)} className="size-3.5 shrink-0 text-ink-muted" />
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {p.demoUrl ? <SiteButton href={p.demoUrl} variant="outline" /> : null}
          <DetailButton label="Détail" title={p.title} onOpen={onOpen} />
        </div>
      </Reveal>
    </li>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [detail, setDetail] = useState<Project | null>(null);
  const [featured, ...rest] = projects;

  /* Les vitrines, dans l'ordre des groupes. La numérotation court sur toutes,
     le projet phare compris (il serait le 01) : 02, 03… d'un groupe à
     l'autre ; une sur deux a son visuel à droite. */
  const kindOf = (p: Project) => (GROUPS.some((g) => g.kind === p.kind) ? p.kind : "personal");
  const ordered = GROUPS.flatMap((g) => rest.filter((p) => kindOf(p) === g.kind));
  const groups = GROUPS.map((g) => ({
    ...g,
    items: ordered
      .map((p, i) => ({ p, num: i + 2, flip: i % 2 === 1 }))
      .filter(({ p }) => kindOf(p) === g.kind),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <SectionHeader
        num="01"
        label="Projets"
        title="Ce que j'ai construit et livré."
        intro="Mon produit d'abord, puis les plateformes réalisées chez Netsen Group pour des ministères guinéens, et pour une entreprise au Sénégal."
        illustration={{
          src: "/pirate/coffre.png",
          width: 640,
          height: 426,
          display: { mobile: 200, desktop: 300 },
        }}
      />

      {featured ? <Featured p={featured} onOpen={() => setDetail(featured)} /> : null}

      {groups.map((g) => (
        <section key={g.kind} aria-label={g.label}>
          <p className="meta mt-14 border-b border-line pb-4 md:mt-24">{g.label}</p>
          <ol>
            {g.items.map(({ p, num, flip }) => (
              <Showcase key={p.id} p={p} num={num} flip={flip} onOpen={() => setDetail(p)} />
            ))}
          </ol>
        </section>
      ))}

      <ProjectSheet
        project={detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      />
    </>
  );
}
