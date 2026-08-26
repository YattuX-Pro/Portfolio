"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmOptions = {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/**
 * Confirmation modale accessible (piège de focus, Échap, annoncée par les
 * lecteurs d'écran via le Dialog base-ui). Repris de l'admin Guidoc.
 *
 * Usage :
 *   const confirm = useConfirm()
 *   if (await confirm({ title: "Supprimer ?", destructive: true })) { … }
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolve = React.useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={options !== null}
        onOpenChange={(open) => {
          if (!open) resolve(false);
        }}
      >
        {options && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{options.title}</DialogTitle>
              {options.description && (
                <DialogDescription>{options.description}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => resolve(false)}
              >
                {options.cancelText ?? "Annuler"}
              </Button>
              <Button
                variant={options.destructive ? "destructive" : "default"}
                className="cursor-pointer"
                onClick={() => resolve(true)}
              >
                {options.confirmText ?? "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirm doit être utilisé à l'intérieur de <ConfirmProvider>",
    );
  }
  return ctx;
}
