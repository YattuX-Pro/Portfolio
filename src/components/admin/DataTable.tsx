"use client";

import { useState } from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/* TanStack laisse `meta` libre : on le type ici pour que les colonnes
   déclarent leur largeur et leur alignement comme chez Guidoc, sans `any`. */
declare module "@tanstack/react-table" {
  /* Les deux paramètres sont imposés par la signature d'origine de
     l'interface ; ils ne servent pas ici, d'où la désactivation. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Largeur CSS appliquée via <colgroup>. Omise, la colonne s'ajuste. */
    width?: string;
    /** Les nombres se lisent alignés à droite ; le texte, à gauche. */
    align?: "left" | "right" | "center";
    /** Masque la colonne sous ce point de rupture. Le tableau défile sinon. */
    hideBelow?: "sm" | "md" | "lg";
  }
}

const ALIGN = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const;

/* Table de la console : recherche texte, filtre par facette, tri par colonne
   et pagination. Tout se fait côté client — les volumes ici sont de l'ordre
   de la dizaine de lignes, envoyer des requêtes paginées au serveur serait
   plus de latence pour aucun gain.

   L'habillage (barre d'outils, cadre, pied de liste) reprend celui de
   l'admin Guidoc : boîte de recherche cerclée, filtres en pastilles,
   conteneur `rounded-xl` sur fond de carte, pied discret. */

export type FacetFilter = {
  columnId: string;
  label: string;
  options: { value: string; label: string }[];
};

/**
 * En-tête de colonne triable, dans le style Guidoc : le libellé en capitales
 * espacées et la flèche de tri qui n'apparaît qu'au survol tant que la
 * colonne n'est pas celle du tri courant.
 *
 * À utiliser dans `header` plutôt qu'un bouton brut : un `<Button>` shadcn
 * dans un `<th>` de 10 px casse l'alignement de la ligne d'en-tête.
 */
export function SortHeader<TData, TValue>({
  column,
  children,
  align = "left",
}: {
  column: Column<TData, TValue>;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const sorted = column.getIsSorted();
  const Icon = !sorted ? ChevronsUpDown : sorted === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "group/sort inline-flex cursor-pointer items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        align === "right" && "flex-row-reverse",
        sorted && "text-foreground",
      )}
    >
      {children}
      <Icon
        className={cn(
          "size-3 transition-opacity",
          sorted ? "opacity-100" : "opacity-0 group-hover/sort:opacity-60",
        )}
      />
    </button>
  );
}

const ALL = "__all__";

export default function DataTable<TData, TValue>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = "Rechercher…",
  facet,
  countLabel = "ligne",
  emptyTitle = "Aucun résultat",
  emptyDescription,
  toolbarEnd,
  pageSize = 8,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumnId: string;
  searchPlaceholder?: string;
  facet?: FacetFilter;
  /** Nom au singulier de ce qui est listé : « projet », « compétence »… */
  countLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbarEnd?: React.ReactNode;
  pageSize?: number;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  /* Le compilateur React signale que la valeur renvoyée par useReactTable
     ne peut pas être mémoïsée sûrement. C'est attendu avec TanStack Table
     v8 : la table est un objet mutable rafraîchi à chaque rendu. Rien à
     corriger côté appelant. */
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize } },
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const searchValue =
    (table.getColumn(searchColumnId)?.getFilterValue() as string) ?? "";
  const facetValue = facet
    ? ((table.getColumn(facet.columnId)?.getFilterValue() as string) ?? ALL)
    : ALL;

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = Math.max(1, table.getPageCount());

  function setSearch(value: string) {
    table.getColumn(searchColumnId)?.setFilterValue(value);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-8 w-full min-w-0 border-0 bg-transparent px-1 text-sm shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:w-64"
          />
          {searchValue && (
            <button
              type="button"
              aria-label="Effacer la recherche"
              onClick={() => setSearch("")}
              className="cursor-pointer"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {facet && (
          <div
            role="group"
            aria-label={facet.label}
            className="scrollbar-hidden flex max-w-full items-center gap-1 overflow-x-auto"
          >
            {[{ value: ALL, label: "Tous" }, ...facet.options].map((option) => {
              const active = facetValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    table
                      .getColumn(facet.columnId)
                      ?.setFilterValue(
                        option.value === ALL ? undefined : option.value,
                      )
                  }
                  className={cn(
                    "cursor-pointer whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {toolbarEnd}
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {selectedCount > 0
              ? `${selectedCount} sélectionné${selectedCount !== 1 ? "s" : ""}`
              : `${filteredCount} ${countLabel}${filteredCount !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Table. Défilement horizontal plutôt que colonnes repliées : rien ne
          devient inatteignable sur un écran étroit. */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            {/* <colgroup> : sans lui, chaque colonne se réduit à son contenu et
                le reste de la largeur s'accumule en vide à droite. Les
                pourcentages déclarés dans `meta.width` répartissent la ligne
                entière — c'est le mécanisme de la table Guidoc. */}
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col
                  key={column.id}
                  style={
                    column.columnDef.meta?.width
                      ? { width: column.columnDef.meta.width }
                      : undefined
                  }
                />
              ))}
            </colgroup>

            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          ALIGN[meta?.align ?? "left"],
                          meta?.hideBelow && HIDE_BELOW[meta.hideBelow],
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    /* `group` sert aux actions révélées au survol. */
                    className="group"
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            ALIGN[meta?.align ?? "left"],
                            meta?.align === "right" && "tabular-nums",
                            meta?.hideBelow && HIDE_BELOW[meta.hideBelow],
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-auto p-0">
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>{emptyTitle}</EmptyTitle>
                        {emptyDescription ? (
                          <EmptyDescription>{emptyDescription}</EmptyDescription>
                        ) : null}
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pied de liste. Le résumé reste affiché même sur une page unique :
          sans lui, on croit la liste tronquée sans moyen de voir la suite. */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-xs text-muted-foreground">
          {filteredCount} {countLabel}
          {filteredCount !== 1 ? "s" : ""}
          {filteredCount > 0 && ` · page ${pageIndex + 1} sur ${pageCount}`}
        </span>

        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-3.5" />
              Précédent
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Suivant
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
