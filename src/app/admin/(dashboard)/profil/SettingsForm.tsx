"use client";

import { useActionState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { SiteSettings } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { updateSettings, type ActionState } from "./actions";

/* Date -> « 2022-09-01T00:00 », la seule forme qu'accepte `datetime-local`.

   Lu en UTC (`toISOString`) et non en heure locale du navigateur, pour la
   même raison que côté serveur : c'est la convention dans laquelle l'action
   enregistre. Formater ici en heure locale aurait décalé la valeur affichée
   de l'offset du visiteur, et le simple fait de réenregistrer le formulaire
   aurait déplacé la date en base à chaque passage. */
function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 16);
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

export default function SettingsForm({
  settings,
  cvHref,
}: {
  settings: SiteSettings | null;
  /* URL publique du CV, résolue côté serveur. La valeur en base est une clé
     de stockage (« neon:… »), pas une adresse : le composant client ne peut
     pas la reconstruire, l'endpoint n'est connu que du serveur. */
  cvHref: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateSettings, {
    error: null,
  });

  useEffect(() => {
    if (state.ok) toast.success("Profil mis à jour.");
  }, [state.ok]);

  const hasCv = Boolean(settings?.cvUrl);

  return (
    <form action={action}>
      <FieldGroup>
        {/* Deux colonnes dès 768 px, comme les formulaires de Guidoc : sur un
            écran large, une seule colonne de champs laisserait la moitié de la
            carte vide. La bio et le CV, qui portent du texte long, occupent la
            largeur entière. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="heroRole">Rôle affiché</FieldLabel>
            <Input
              id="heroRole"
              name="heroRole"
              required
              placeholder="Analyste Développeur"
              defaultValue={settings?.heroRole ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="method">Méthode</FieldLabel>
            <Input
              id="method"
              name="method"
              placeholder="Agile Scrum"
              defaultValue={settings?.method ?? ""}
            />
            <FieldDescription>
              Affichée sous la grille des compétences. Vide = ligne masquée.
            </FieldDescription>
          </Field>

          {/* Origine du compteur d'expérience du hero. `datetime-local` et
              non `date` : le compteur descend au centième de seconde, une
              date sans heure aurait figé les champs heures/minutes/secondes
              du hero sur minuit. */}
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="experienceStartAt">
              Premier contrat (compteur d&apos;expérience)
            </FieldLabel>
            <Input
              id="experienceStartAt"
              name="experienceStartAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(settings?.experienceStartAt)}
            />
            <FieldDescription>
              Date et heure de signature. Le hero en déduit l&apos;ancienneté en
              direct — années, mois, jours, heures, minutes, secondes. Vide =
              bloc masqué sur le portfolio.
            </FieldDescription>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="heroBio">Bio</FieldLabel>
            <Textarea
              id="heroBio"
              name="heroBio"
              required
              rows={3}
              placeholder="Une ou deux phrases sur ce que vous faites."
              defaultValue={settings?.heroBio ?? ""}
            />
          </Field>

          <Field orientation="horizontal" className="md:col-span-2">
            <Switch
              id="heroAvailable"
              name="heroAvailable"
              defaultChecked={settings?.heroAvailable ?? true}
            />
            <FieldLabel htmlFor="heroAvailable">
              Afficher « Disponible » dans le hero
            </FieldLabel>
          </Field>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="vous@exemple.com"
              defaultValue={settings?.email ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="githubUrl">GitHub</FieldLabel>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/…"
              defaultValue={settings?.githubUrl ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/…"
              defaultValue={settings?.linkedinUrl ?? ""}
            />
          </Field>

          {/* Le CV se téléverse, il ne se saisit plus comme lien : coller un
              chemin qui n'existe pas donnait un bouton « Télécharger le CV »
              cassé sur le portfolio, sans rien pour le signaler. */}
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="cvFile">CV (PDF)</FieldLabel>
            <Input
              id="cvFile"
              name="cvFile"
              type="file"
              accept="application/pdf"
            />
            <FieldDescription>
              {hasCv
                ? "Un CV est en ligne. Choisir un fichier le remplace."
                : "Aucun CV en ligne : le bouton de téléchargement est masqué sur le portfolio."}
              {" "}10 Mo maximum.
            </FieldDescription>

            {hasCv ? (
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <a
                  href={cvHref ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                >
                  <FileText className="size-3.5" />
                  {/* « Télécharger » et non « Voir » : l'objet porte un
                      Content-Disposition: attachment, il s'enregistre au lieu
                      de s'afficher. */}
                  Télécharger le CV en ligne
                </a>

                {/* Une case et non un bouton : la suppression part avec
                    l'enregistrement du formulaire, comme le reste. Un bouton
                    l'exécuterait aussitôt, sans possibilité d'annuler. */}
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox id="cvRemove" name="cvRemove" />
                  Retirer le CV du portfolio
                </label>
              </div>
            ) : null}
          </Field>
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {/* Bouton aligné à droite, au bord de la carte : c'est là qu'on le
            cherche quand le formulaire fait toute la largeur. */}
        <div className="flex justify-end">
          <Submit />
        </div>
      </FieldGroup>
    </form>
  );
}
