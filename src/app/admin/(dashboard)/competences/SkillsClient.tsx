"use client";

import { useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import type { SkillGroup } from "@/lib/db/queries";
import DataTable, { SortHeader } from "@/components/admin/DataTable";
import TabbedPage from "@/components/admin/TabbedPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { ACCENT_OPTIONS, ACCENT_VARS } from "./constants";
import {
  addItem,
  deleteItem,
  deleteCategory,
  moveCategory,
  createCategory,
  updateCategory,
} from "./actions";

type Row = { id: number; label: string; category: string; accent: string };

export default function SkillsClient({
  categories,
}: {
  categories: SkillGroup[];
}) {
  const [isPending, startTransition] = useTransition();
  const [addingTo, setAddingTo] = useState<string>(
    categories[0] ? String(categories[0].id) : "",
  );
  const [newItem, setNewItem] = useState("");
  const [categorySheet, setCategorySheet] = useState<SkillGroup | "new" | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<SkillGroup | null>(null);

  const rows: Row[] = categories.flatMap((c) =>
    c.items.map((i) => ({
      id: i.id,
      label: i.label,
      category: c.label,
      accent: c.accent,
    })),
  );

  function run(
    fn: (fd: FormData) => Promise<void>,
    fd: FormData,
    message: string,
  ) {
    startTransition(async () => {
      await fn(fd);
      toast.success(message);
    });
  }

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => <SortHeader column={column}>Compétence</SortHeader>,
      /* Voir columns.tsx des projets : les largeurs occupent la ligne. */
      meta: { width: "45%" },
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.label}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      meta: { width: "45%" },
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="block size-2.5 shrink-0 rounded-[2px]"
            style={{
              backgroundColor:
                ACCENT_VARS[row.original.accent] ?? "var(--text)",
            }}
          />
          <Badge variant="outline">{row.original.category}</Badge>
        </span>
      ),
      filterFn: (row, id, value) => row.getValue(id) === value,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      meta: { width: "10%", align: "right" as const },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Retirer ${row.original.label}`}
            className="cursor-pointer text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
            disabled={isPending}
            onClick={() => {
              const fd = new FormData();
              fd.set("id", String(row.original.id));
              run(deleteItem, fd, `« ${row.original.label} » retirée.`);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const skillsTab = (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={rows}
        searchColumnId="label"
        searchPlaceholder="Rechercher une compétence…"
        facet={{
          columnId: "category",
          label: "Catégorie",
          options: categories.map((c) => ({ value: c.label, label: c.label })),
        }}
        countLabel="compétence"
        emptyTitle="Aucune compétence"
        emptyDescription="Ajoutez-en une avec le formulaire ci-dessous."
      />

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une compétence</CardTitle>
          <CardDescription>
            Elle apparaît aussitôt sur le portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="sm:w-[220px] sm:shrink-0">
              <FieldLabel htmlFor="cat">Catégorie</FieldLabel>
              {/* base-ui peut émettre null (désélection) : on le ramène à "". */}
              <Select
                value={addingTo}
                onValueChange={(v) => setAddingTo(v ?? "")}
              >
                {/* `w-full` : le déclencheur shadcn est en `w-fit`, il se
                    serait réduit à la longueur du libellé au lieu de remplir
                    son champ, à côté d'un champ texte pleine largeur. */}
                <SelectTrigger id="cat" className="w-full">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="flex-1">
              <FieldLabel htmlFor="item">Nom</FieldLabel>
              <Input
                id="item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Ex. Kubernetes"
              />
            </Field>

            <Button
              disabled={isPending || !newItem.trim() || !addingTo}
              onClick={() => {
                const fd = new FormData();
                fd.set("categoryId", addingTo);
                fd.set("label", newItem.trim());
                startTransition(async () => {
                  await addItem({ error: null }, fd);
                  toast.success(`« ${newItem.trim()} » ajoutée.`);
                  setNewItem("");
                });
              }}
            >
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const categoriesTab = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Leur ordre est celui des colonnes sur le portfolio.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => setCategorySheet("new")}
        >
          <Plus className="size-4" />
          Nouvelle
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {categories.map((c, i) => (
          <li
            key={c.id}
            className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span
              aria-hidden
              className="block size-3 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: ACCENT_VARS[c.accent] ?? "var(--text)",
              }}
            />
            <span className="flex-1 min-w-0">
              <span className="block font-medium truncate">{c.label}</span>
              <span className="block text-xs text-muted-foreground">
                {c.items.length} compétence{c.items.length > 1 ? "s" : ""}
              </span>
            </span>

            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              aria-label={`Monter ${c.label}`}
              disabled={i === 0 || isPending}
              onClick={() => {
                const fd = new FormData();
                fd.set("id", String(c.id));
                fd.set("direction", "up");
                run(moveCategory, fd, "Ordre mis à jour.");
              }}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              aria-label={`Descendre ${c.label}`}
              disabled={i === categories.length - 1 || isPending}
              onClick={() => {
                const fd = new FormData();
                fd.set("id", String(c.id));
                fd.set("direction", "down");
                run(moveCategory, fd, "Ordre mis à jour.");
              }}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setCategorySheet(c)}
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label={`Supprimer ${c.label}`}
              onClick={() => setPendingDelete(c)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <TabbedPage
        title="Compétences"
        description="Ce qui s'affiche dans la section Compétences du portfolio."
        tabs={[
          { value: "competences", label: "Compétences", content: skillsTab },
          { value: "categories", label: "Catégories", content: categoriesTab },
        ]}
      />

      <Sheet
        open={categorySheet !== null}
        onOpenChange={(o) => !o && setCategorySheet(null)}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {categorySheet === "new"
                ? "Nouvelle catégorie"
                : "Modifier la catégorie"}
            </SheetTitle>
            <SheetDescription>
              La couleur sert de repère visuel sur le portfolio.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <form
              action={async (fd) => {
                const isNew = categorySheet === "new";
                if (!isNew && categorySheet)
                  fd.set("id", String(categorySheet.id));
                const res = await (isNew ? createCategory : updateCategory)(
                  { error: null },
                  fd,
                );
                if (res.error) toast.error(res.error);
                else {
                  toast.success(
                    isNew ? "Catégorie créée." : "Catégorie mise à jour.",
                  );
                  setCategorySheet(null);
                }
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="label">Nom</FieldLabel>
                  <Input
                    id="label"
                    name="label"
                    required
                    defaultValue={
                      categorySheet && categorySheet !== "new"
                        ? categorySheet.label
                        : ""
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="accent">Couleur</FieldLabel>
                  <Select
                    name="accent"
                    defaultValue={
                      categorySheet && categorySheet !== "new"
                        ? categorySheet.accent
                        : "text"
                    }
                  >
                    <SelectTrigger id="accent" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ACCENT_OPTIONS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Le jaune du drapeau n&apos;est pas proposé : à 1,41:1 il ne
                    franchit pas le seuil de contraste de 3:1.
                  </FieldDescription>
                </Field>

                <Button type="submit">Enregistrer</Button>
              </FieldGroup>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {pendingDelete?.label} » et ses {pendingDelete?.items.length}{" "}
              compétences seront supprimées. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const c = pendingDelete;
                if (!c) return;
                const fd = new FormData();
                fd.set("id", String(c.id));
                run(deleteCategory, fd, `« ${c.label} » supprimée.`);
                setPendingDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
