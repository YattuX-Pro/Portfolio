/* En-tête de page de l'administration. Le fil d'Ariane situe, ce titre
   nomme et explique — sans lui le contenu démarrait à sec sur la barre
   d'outils. */
export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
