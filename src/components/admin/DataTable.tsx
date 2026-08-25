"use client";

import { useState } from "react";
import {
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
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

/* Table générique : recherche texte, filtre par facette, tri par colonne
   et pagination. Tout se fait côté client — les volumes ici sont de l'ordre
   de la dizaine de lignes, envoyer des requêtes paginées au serveur serait
   plus de latence pour aucun gain. */

export type FacetFilter = {
  columnId: string;
  label: string;
  options: { value: string; label: string }[];
};

const ALL = "__all__";

export default function DataTable<TData, TValue>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = "Rechercher…",
  facet,
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

  return (
    <div className="flex flex-col gap-4">
      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={searchValue}
            onChange={(e) =>
              table.getColumn(searchColumnId)?.setFilterValue(e.target.value)
            }
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </InputGroup>

        {facet ? (
          <Select
            value={facetValue}
            onValueChange={(v) =>
              table
                .getColumn(facet.columnId)
                ?.setFilterValue(v === ALL ? undefined : v)
            }
          >
            <SelectTrigger className="sm:w-[190px]" aria-label={facet.label}>
              {/* Libellé explicite plutôt que <SelectValue> : la valeur
                  sentinelle __all__ s'affichait telle quelle dans le
                  déclencheur au lieu du texte « Statut : tous ». */}
              <span className="truncate">
                {facetValue === ALL
                  ? `${facet.label} : tous`
                  : (facet.options.find((o) => o.value === facetValue)?.label ??
                    facet.label)}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ALL}>{facet.label} : tous</SelectItem>
                {facet.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}

        {toolbarEnd ? <div className="sm:ml-auto">{toolbarEnd}</div> : null}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-auto p-0">
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

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {selectedCount > 0
            ? `${selectedCount} sur ${filteredCount} ligne${filteredCount > 1 ? "s" : ""} sélectionnée${selectedCount > 1 ? "s" : ""}`
            : `${filteredCount} ligne${filteredCount > 1 ? "s" : ""}`}
        </p>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
