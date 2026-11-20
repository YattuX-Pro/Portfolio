import { getSettings } from "@/lib/db/queries";
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

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const settings = await getSettings();

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
      ]}
    />
  );
}
