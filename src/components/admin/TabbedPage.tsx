"use client";

import Header from "@/components/admin/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PageTab = {
  value: string;
  label: string;
  content: React.ReactNode;
};

/* Une page dont les sections sont des onglets plutôt qu'une pile de cartes.
   Les onglets vivent dans le bandeau collant : ils restent visibles quand le
   panneau défile, et la page garde une seule route — ce sont des sections,
   pas des destinations. */
export default function TabbedPage({
  title,
  description,
  actions,
  tabs,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs: PageTab[];
}) {
  return (
    <Tabs defaultValue={tabs[0]?.value} className="gap-0">
      <Header title={title} description={description} actions={actions}>
        <TabsList
          variant="line"
          className="h-9 w-full justify-start overflow-x-auto rounded-none px-4"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-none px-3"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Header>

      {/* Même gouttière que les pages Guidoc : p-6, p-8 au-delà de 1024 px. */}
      <div className="flex flex-1 flex-col gap-4 p-6 lg:p-8">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
