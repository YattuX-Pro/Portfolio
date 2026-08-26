"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { Project } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SortHeader } from "@/components/admin/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ProjectRowActions = {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onMove: (project: Project, direction: "up" | "down") => void;
};

export function buildColumns(actions: ProjectRowActions): ColumnDef<Project>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        /* base-ui expose `indeterminate` comme prop distincte : contrairement
           à Radix, `checked` n'accepte pas la chaîne "indeterminate". */
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label={`Sélectionner ${row.original.title}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { width: "3rem" },
    },
    {
      accessorKey: "title",
      header: ({ column }) => <SortHeader column={column}>Titre</SortHeader>,
      /* Les largeurs se répartissent la ligne entière : sans elles, chaque
         colonne se réduit à son contenu et le reste part en vide à droite. */
      meta: { width: "34%" },
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{row.original.title}</span>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "stack",
      header: "Stack",
      enableSorting: false,
      meta: { width: "34%" },
      cell: ({ row }) => {
        const stack = row.original.stack;
        if (stack.length === 0) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1">
            {stack.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
            {stack.length > 2 ? (
              <Badge variant="outline">+{stack.length - 2}</Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      /* Colonne du filtre par facette. La valeur est une chaîne pour que le
         filtre d'égalité de TanStack la compare à celle du Select. */
      id: "statut",
      accessorFn: (row) => (row.published ? "publie" : "masque"),
      header: "Statut",
      meta: { width: "16%" },
      cell: ({ row }) =>
        row.original.published ? (
          <Badge variant="secondary">Publié</Badge>
        ) : (
          <Badge variant="outline">Masqué</Badge>
        ),
      filterFn: (row, id, value) => row.getValue(id) === value,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      meta: { width: "10%", align: "right" as const },
      cell: ({ row, table }) => {
        const project = row.original;
        const index = row.index;
        const total = table.getCoreRowModel().rows.length;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions sur ${project.title}`}
                    /* Révélées au survol de la ligne, comme chez Guidoc.
                       `focus-visible:opacity-100` : au clavier, un bouton
                       invisible mais focusable est un piège. */
                    className="cursor-pointer opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => actions.onEdit(project)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === 0}
                    onClick={() => actions.onMove(project, "up")}
                  >
                    Monter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === total - 1}
                    onClick={() => actions.onMove(project, "down")}
                  >
                    Descendre
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.onDelete(project)}
                  >
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
