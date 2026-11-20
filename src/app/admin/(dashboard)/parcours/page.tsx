import { getExperiences } from "@/lib/db/queries";
import ExperiencesClient from "./ExperiencesClient";

export const dynamic = "force-dynamic";

export default async function AdminJourneyPage() {
  const experiences = await getExperiences();
  return <ExperiencesClient experiences={experiences} />;
}
