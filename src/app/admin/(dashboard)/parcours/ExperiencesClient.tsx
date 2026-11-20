"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import type { Experience } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/admin/DataTable";
import Header from "@/components/admin/Header";
import { buildColumns } from "./columns";
import ExperienceForm from "./ExperienceForm";
import { deleteExperience, moveExperience } from "./actions";

/* Calqué sur `ProjectsClient` : tableau, panneau latéral de création et
   d'édition, confirmation avant suppression. */
export default function ExperiencesClient({
  experiences,
}: {
  experiences: Experience[];
}) {
  const [editing, setEditing] = useState<Experience | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Experience | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns = buildColumns({
    onEdit: (e) => setEditing(e),
    onDelete: (e) => setPendingDelete(e),
    onMove: (e, direction) => {
      const fd = new FormData();
      fd.set("id", String(e.id));
      fd.set("direction", direction);
      startTransition(async () => {
        await moveExperience(fd);
        toast.success(`« ${e.title} » déplacé.`);
      });
    },
  });

  function confirmDelete() {
    const experience = pendingDelete;
    if (!experience) return;
    const fd = new FormData();
    fd.set("id", String(experience.id));
    startTransition(async () => {
      await deleteExperience(fd);
      toast.success(`« ${experience.title} » supprimé.`);
    });
    setPendingDelete(null);
  }

  return (
    <>
      <Header
        title="Parcours"
        description="Section Parcours du portfolio, du plus récent au plus ancien"
        actions={
          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => setCreating(true)}
            disabled={isPending}
          >
            <PlusIcon className="size-4" />
            Nouvelle étape
          </Button>
        }
      />

      <div className="flex flex-1 flex-col gap-4 p-6 lg:p-8">
        <DataTable
          columns={columns}
          data={experiences}
          searchColumnId="title"
          searchPlaceholder="Rechercher une étape…"
          countLabel="étape"
          facet={{
            columnId: "type",
            label: "Type",
            options: [
              { value: "work", label: "Postes" },
              { value: "education", label: "Formations" },
            ],
          }}
          emptyTitle="Aucune étape"
          emptyDescription="Ajoutez votre poste actuel pour ouvrir le journal de bord."
        />

        {/* Création */}
        <Sheet open={creating} onOpenChange={setCreating}>
          <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Nouvelle étape</SheetTitle>
              <SheetDescription>
                Elle s&apos;ajoute en tête du journal ; déplacez-la ensuite si
                elle est plus ancienne.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8">
              <ExperienceForm onSaved={() => setCreating(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Édition */}
        <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
          <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Modifier l&apos;étape</SheetTitle>
              <SheetDescription>{editing?.title}</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8">
              {/* `key` réinitialise les champs non contrôlés quand on passe
                  d'une étape à l'autre sans fermer le panneau. */}
              {editing ? (
                <ExperienceForm
                  key={editing.id}
                  experience={editing}
                  onSaved={() => setEditing(null)}
                />
              ) : null}
            </div>
          </SheetContent>
        </Sheet>

        {/* Suppression */}
        <AlertDialog
          open={pendingDelete !== null}
          onOpenChange={(o) => !o && setPendingDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette étape ?</AlertDialogTitle>
              <AlertDialogDescription>
                « {pendingDelete?.title} » sera définitivement retirée du
                parcours et de la base. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
