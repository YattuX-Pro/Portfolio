import { getSettings, getHeroStats, getHeroStack } from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/admin/PageHeader";
import SettingsForm from "./SettingsForm";
import ListEditor from "./ListEditor";
import { addStat, deleteStat, addStackRow, deleteStackRow } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  /* Trois lectures indépendantes : en parallèle, jamais en cascade. */
  const [settings, stats, stack] = await Promise.all([
    getSettings(),
    getHeroStats(),
    getHeroStack(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profil"
        description="Identité, disponibilité, coordonnées et contenu du hero."
      />

      <Card>
        <CardHeader>
          <CardTitle>Identité & contact</CardTitle>
          <CardDescription>
            Ce qui s&apos;affiche dans le hero et la section contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chiffres du hero</CardTitle>
          <CardDescription>{stats.length} entrées affichées sous la bio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListEditor
            rows={stats.map((s) => ({ id: s.id, left: s.value, right: s.label }))}
            fields={{
              left: { name: "value", label: "Chiffre", placeholder: "5+" },
              right: { name: "label", label: "Libellé", placeholder: "Projets" },
            }}
            addAction={addStat}
            deleteAction={deleteStat}
            emptyLabel="Aucun chiffre affiché dans le hero."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colonne « Stack principale »</CardTitle>
          <CardDescription>
            Visible à partir de 1024 px, dans la colonne droite du hero. Vide, la
            colonne disparaît.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListEditor
            rows={stack.map((s) => ({ id: s.id, left: s.groupLabel, right: s.items }))}
            fields={{
              left: { name: "groupLabel", label: "Groupe", placeholder: "Back-end" },
              right: { name: "items", label: "Contenu", placeholder: ".NET · FastAPI" },
            }}
            addAction={addStackRow}
            deleteAction={deleteStackRow}
            emptyLabel="Aucune ligne : la colonne est masquée sur le site."
          />
        </CardContent>
      </Card>
    </div>
  );
}
