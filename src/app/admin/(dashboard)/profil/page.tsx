import { getSettings, getHeroStats, getHeroStack } from "@/lib/db/queries";
import { isStorageKey, publicObjectUrl } from "@/lib/storage";
import TabbedPage from "@/components/admin/TabbedPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  /* La base ne garde qu'une clé de stockage ; l'URL est reconstruite ici,
     côté serveur, parce que l'endpoint vit dans l'environnement. Le
     formulaire, lui, continue de recevoir la valeur brute — sans quoi le
     réenregistrement figerait l'URL complète en base. */
  const cvHref = isStorageKey(settings?.cvUrl)
    ? publicObjectUrl(settings.cvUrl)
    : (settings?.cvUrl ?? null);

  return (
    <TabbedPage
      title="Profil"
      description="Identité affichée sur le portfolio"
      tabs={[
        {
          value: "identite",
          label: "Identité & contact",
          /* Chaque section est une carte pleine largeur, comme les pages
             Paramètres de l'admin Guidoc : titre, sous-titre, puis le
             contenu. C'est la structure interne (grilles, colonnes de
             tableau) qui règle la densité, pas un plafond de largeur. */
          content: (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Identité &amp; contact</CardTitle>
                <CardDescription>
                  Ce qui s&apos;affiche dans le hero et la section contact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm settings={settings} cvHref={cvHref} />
              </CardContent>
            </Card>
          ),
        },
        {
          value: "chiffres",
          label: "Chiffres du hero",
          content: (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Chiffres du hero</CardTitle>
                <CardDescription>
                  {stats.length} entrée{stats.length > 1 ? "s" : ""} affichée
                  {stats.length > 1 ? "s" : ""} sous la bio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ListEditor
                  rows={stats.map((s) => ({
                    id: s.id,
                    left: s.value,
                    right: s.label,
                  }))}
                  fields={{
                    left: { name: "value", label: "Chiffre", placeholder: "5+" },
                    right: {
                      name: "label",
                      label: "Libellé",
                      placeholder: "Projets",
                    },
                  }}
                  addAction={addStat}
                  deleteAction={deleteStat}
                  emptyLabel="Aucun chiffre affiché dans le hero."
                />
              </CardContent>
            </Card>
          ),
        },
        {
          value: "stack",
          label: "Stack principale",
          content: (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Stack principale</CardTitle>
                <CardDescription>
                  Colonne visible à partir de 1024 px, à droite du hero. Vide,
                  la colonne disparaît.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ListEditor
                  rows={stack.map((s) => ({
                    id: s.id,
                    left: s.groupLabel,
                    right: s.items,
                  }))}
                  fields={{
                    left: {
                      name: "groupLabel",
                      label: "Groupe",
                      placeholder: "Back-end",
                    },
                    right: {
                      name: "items",
                      label: "Contenu",
                      placeholder: ".NET · FastAPI",
                    },
                  }}
                  addAction={addStackRow}
                  deleteAction={deleteStackRow}
                  emptyLabel="Aucune ligne : la colonne est masquée sur le site."
                />
              </CardContent>
            </Card>
          ),
        },
      ]}
    />
  );
}
