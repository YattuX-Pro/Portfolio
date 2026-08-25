import { getSkills } from "@/lib/db/queries";
import SkillsClient from "./SkillsClient";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const categories = await getSkills();
  return <SkillsClient categories={categories} />;
}
