"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/lib/db/schema";
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
import { buildColumns } from "./columns";
import ProjectForm from "./ProjectForm";
import { deleteProject, moveProject } from "./actions";

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns = buildColumns({
    onEdit: (p) => setEditing(p),
    onDelete: (p) => setPendingDelete(p),
    onMove: (p, direction) => {
      const fd = new FormData();
      fd.set("id", String(p.id));
      fd.set("direction", direction);
      startTransition(async () => {
        await moveProject(fd);
        toast.success(`« ${p.title} » déplacé.`);
      });
    },
  });

  function confirmDelete() {
    const project = pendingDelete;
    if (!project) return;
    const fd = new FormData();
    fd.set("id", String(project.id));
    startTransition(async () => {
      await deleteProject(fd);
      toast.success(`« ${project.title} » supprimé.`);
    });
    setPendingDelete(null);
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        searchColumnId="title"
        searchPlaceholder="Rechercher un projet…"
        facet={{
          columnId: "statut",
          label: "Statut",
          options: [
            { value: "publie", label: "Publié" },
            { value: "masque", label: "Masqué" },
          ],
        }}
        emptyTitle="Aucun projet"
        emptyDescription="Créez votre premier projet pour l'afficher sur le portfolio."
        toolbarEnd={
          <Button onClick={() => setCreating(true)} disabled={isPending}>
            <PlusIcon data-icon="inline-start" />
            Nouveau projet
          </Button>
        }
      />

      {/* Création */}
      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouveau projet</SheetTitle>
            <SheetDescription>
              Il apparaîtra sur le portfolio dès l&apos;enregistrement, sauf si
              vous le masquez.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <ProjectForm onSaved={() => setCreating(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Édition */}
      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Modifier le projet</SheetTitle>
            <SheetDescription>{editing?.title}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            {/* key force la réinitialisation des champs non contrôlés quand on
                passe d'un projet à l'autre sans fermer le panneau. */}
            {editing ? (
              <ProjectForm
                key={editing.id}
                project={editing}
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
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {pendingDelete?.title} » sera définitivement retiré du portfolio
              et de la base. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
