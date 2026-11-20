"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { Experience } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExperienceRowActions = {
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
  onMove: (experience: Experience, direction: "up" | "down") => void;
};

/* Pas de tri par colonne : l'ordre du tableau EST l'ordre du journal sur le
   site, il se règle avec « Monter » / « Descendre ». Trier par titre aurait
   fait croire à un ordre qui n'est pas celui affiché. */
export function buildColumns(actions: ExperienceRowActions): ColumnDef<Experience>[] {
  return [
    {
      accessorKey: "title",
      header: "Étape",
      enableSorting: false,
      meta: { width: "46%" },
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{row.original.title}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.organization}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "period",
      header: "Période",
      enableSorting: false,
      meta: { width: "26%" },
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.period}
        </span>
      ),
    },
    {
      /* Colonne du filtre par facette. */
      id: "type",
      accessorFn: (row) => row.kind,
      header: "Type",
      meta: { width: "18%" },
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="secondary">
            {row.original.kind === "education" ? "Formation" : "Poste"}
          </Badge>
          {row.original.current ? <Badge>En cours</Badge> : null}
        </div>
      ),
      filterFn: (row, id, value) => row.getValue(id) === value,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      meta: { width: "10%", align: "right" as const },
      cell: ({ row, table }) => {
        const experience = row.original;
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
                    aria-label={`Actions sur ${experience.title}`}
                    className="cursor-pointer opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => actions.onEdit(experience)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === 0}
                    onClick={() => actions.onMove(experience, "up")}
                  >
                    Monter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === total - 1}
                    onClick={() => actions.onMove(experience, "down")}
                  >
                    Descendre
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.onDelete(experience)}
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
