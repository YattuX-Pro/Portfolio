"use client";

import { useState, useTransition } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionState } from "./actions";

/* Éditeur générique à deux colonnes, partagé par les chiffres du hero
   (valeur / libellé) et la colonne stack (groupe / contenu). Volumes de
   l'ordre de la poignée de lignes : ni pagination ni filtre ici, ce serait
   du bruit pour trois entrées. */
export default function ListEditor({
  rows,
  fields,
  addAction,
  deleteAction,
  emptyLabel,
}: {
  rows: { id: number; left: string; right: string }[];
  fields: {
    left: { name: string; label: string; placeholder: string };
    right: { name: string; label: string; placeholder: string };
  };
  addAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (formData: FormData) => Promise<void>;
  emptyLabel: string;
}) {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{emptyLabel}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{fields.left.label}</TableHead>
                <TableHead>{fields.right.label}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.left}</TableCell>
                  <TableCell className="text-muted-foreground">{row.right}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Supprimer ${row.left}`}
                      disabled={isPending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("id", String(row.id));
                        startTransition(async () => {
                          await deleteAction(fd);
                          toast.success("Ligne supprimée.");
                        });
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="sm:max-w-[160px]">
          <FieldLabel htmlFor={fields.left.name}>{fields.left.label}</FieldLabel>
          <Input
            id={fields.left.name}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder={fields.left.placeholder}
          />
        </Field>
        <Field className="flex-1">
          <FieldLabel htmlFor={fields.right.name}>{fields.right.label}</FieldLabel>
          <Input
            id={fields.right.name}
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder={fields.right.placeholder}
          />
        </Field>
        <Button
          disabled={isPending || !left.trim() || !right.trim()}
          onClick={() => {
            const fd = new FormData();
            fd.set(fields.left.name, left.trim());
            fd.set(fields.right.name, right.trim());
            startTransition(async () => {
              const res = await addAction({ error: null }, fd);
              if (res.error) toast.error(res.error);
              else {
                toast.success("Ligne ajoutée.");
                setLeft("");
                setRight("");
              }
            });
          }}
        >
          <PlusIcon data-icon="inline-start" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}
