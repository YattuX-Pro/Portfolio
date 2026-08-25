import PageHeader from "@/components/admin/PageHeader";
import ContentTabs from "./ContentTabs";

export default function ContenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Contenu"
        description="Ce que le portfolio raconte : expertise, identité, contact."
      >
        <ContentTabs />
      </PageHeader>
      <main className="p-4 md:p-6">{children}</main>
    </>
  );
}
