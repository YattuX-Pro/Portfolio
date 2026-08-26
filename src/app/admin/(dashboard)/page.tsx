import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProjects, getSkills, getSettings } from "@/lib/db/queries";
import Header from "@/components/admin/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

/* Carte de chiffre, reprise de l'admin Guidoc (dashboard/stat-cards) :
   libellé en mono capitales, valeur en gros chiffres tabulaires, précision
   facultative en dessous. Aucune icône — c'est le chiffre qui porte. */
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {/* Charte : les titres sont en 600 avec l'approche serrée, jamais en
            700 — la hiérarchie vient de la graisse et du tracking. */}
        <p className="mt-1.5 text-3xl font-semibold tracking-[-0.03em] tabular-nums">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  /* Trois lectures indépendantes : en parallèle, jamais en cascade. */
  const [projects, skills, settings] = await Promise.all([
    getAllProjects(),
    getSkills(),
    getSettings(),
  ]);

  const published = projects.filter((p) => p.published);
  const hidden = projects.length - published.length;
  const skillCount = skills.reduce((n, c) => n + c.items.length, 0);
  const lastUpdated = projects.reduce<Date | null>(
    (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
    null,
  );

  return (
    <>
      <Header title="Tableau de bord" description="Vue d'ensemble du contenu" />

      <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Projets publiés"
            value={String(published.length)}
            sub={
              hidden > 0
                ? `${hidden} masqué${hidden > 1 ? "s" : ""}`
                : "Aucun masqué"
            }
          />
          <StatCard
            label="Catégories"
            value={String(skills.length)}
            sub={`${skillCount} compétence${skillCount > 1 ? "s" : ""}`}
          />
          <StatCard
            label="Disponibilité"
            value={settings?.heroAvailable ? "Oui" : "Non"}
            sub="Affichée dans le hero"
          />
          <StatCard
            label="Dernière modif."
            value={
              lastUpdated
                ? lastUpdated.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "—"
            }
            sub="Projet le plus récent"
          />
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Projets récents</CardTitle>
            <CardDescription>
              Les cinq dernières entrées et leur statut.
            </CardDescription>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto cursor-pointer gap-1.5"
              render={
                <Link href="/admin/projets">
                  Tout gérer
                  <ArrowRight className="size-3.5" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Aucun projet</EmptyTitle>
                  <EmptyDescription>
                    Créez votre premier projet pour l&apos;afficher sur le
                    portfolio.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead className="hidden sm:table-cell">Stack</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.slice(0, 5).map((p) => (
                    <TableRow key={p.id} className="last:border-0">
                      <TableCell className="text-sm font-medium">
                        {p.title}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {p.stack.slice(0, 3).join(" · ") || "—"}
                      </TableCell>
                      <TableCell>
                        {p.published ? (
                          <Badge variant="secondary">Publié</Badge>
                        ) : (
                          <Badge variant="outline">Masqué</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
