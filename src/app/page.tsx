import PortfolioApp from "@/components/PortfolioApp";
import { getSiteData } from "@/lib/db/queries";

/* Rendu statique régénéré toutes les 5 minutes. Les modifications faites
   depuis l'admin déclenchent en plus un revalidatePath("/") immédiat, donc
   ce délai n'est qu'un filet de sécurité. */
export const revalidate = 300;

export default async function Home() {
  const data = await getSiteData();
  return <PortfolioApp data={data} />;
}
