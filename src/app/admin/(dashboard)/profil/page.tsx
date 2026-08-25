import { getSettings, getHeroStats, getHeroStack } from "@/lib/db/queries";
import TabbedPage from "@/components/admin/TabbedPage";
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
    <TabbedPage
      title="Profil"
      description="Votre identité telle qu'elle apparaît sur le portfolio."
      tabs={[
        {
          value: "identite",
          label: "Identité & contact",
          content: (
            <section className="max-w-3xl">
              <p className="mb-4 text-sm text-muted-foreground">
                Ce qui s&apos;affiche dans le hero et la section contact.
              </p>
              <SettingsForm settings={settings} />
            </section>
          ),
        },
        {
          value: "chiffres",
          label: "Chiffres du hero",
          content: (
            <section className="max-w-3xl">
              <p className="mb-4 text-sm text-muted-foreground">
                {stats.length} entrée{stats.length > 1 ? "s" : ""} affichée
                {stats.length > 1 ? "s" : ""} sous la bio.
              </p>
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
            </section>
          ),
        },
        {
          value: "stack",
          label: "Stack principale",
          content: (
            <section className="max-w-3xl">
              <p className="mb-4 text-sm text-muted-foreground">
                Colonne visible à partir de 1024 px, à droite du hero. Vide, la
                colonne disparaît.
              </p>
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
            </section>
          ),
        },
      ]}
    />
  );
}
