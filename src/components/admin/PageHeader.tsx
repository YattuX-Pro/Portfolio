import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

/* En-tête rendu par CHAQUE page, comme dans l'admin Guidoc, plutôt qu'un fil
   d'Ariane générique dans le layout : la page connaît son titre, sa
   description et ses actions, le layout non. */
export default function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 h-5" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-[-0.01em]">
            {title}
          </h1>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {/* Zone d'onglets, quand la page en a. */}
      {children}
    </header>
  );
}
