import Link from "next/link";
import {
  FolderKanbanIcon,
  LayersIcon,
  CircleCheckIcon,
  ClockIcon,
  ArrowRightIcon,
} from "lucide-react";
import { getAllProjects, getSkills, getSettings } from "@/lib/db/queries";
import PageHeader from "@/components/admin/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function StatCard({
  icon: Icon,
  value,
  label,
  hint,
}: {
  icon: typeof FolderKanbanIcon;
  value: string | number;
  label: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{hint}</p>
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble du contenu publié sur le portfolio."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanbanIcon}
          value={published.length}
          label="Projets publiés"
          hint={hidden > 0 ? `${hidden} masqué${hidden > 1 ? "s" : ""}` : "Aucun masqué"}
        />
        <StatCard
          icon={LayersIcon}
          value={skills.length}
          label="Catégories"
          hint={`${skillCount} compétences`}
        />
        <StatCard
          icon={CircleCheckIcon}
          value={settings?.heroAvailable ? "Oui" : "Non"}
          label="Disponible"
          hint="Affiché dans le hero"
        />
        <StatCard
          icon={ClockIcon}
          value={
            lastUpdated
              ? lastUpdated.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : "—"
          }
          label="Dernière modif."
          hint="Projet le plus récent"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projets récents</CardTitle>
          <CardDescription>Les cinq dernières entrées et leur statut.</CardDescription>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            render={
              <Link href="/admin/projets">
                Tout gérer
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            }
          />
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Aucun projet</EmptyTitle>
                <EmptyDescription>
                  Créez votre premier projet pour l&apos;afficher sur le portfolio.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden sm:table-cell">Stack</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.slice(0, 5).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
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
  );
}
