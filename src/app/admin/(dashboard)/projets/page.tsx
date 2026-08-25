import { getAllProjects } from "@/lib/db/queries";
import ProjectsClient from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();
  return <ProjectsClient projects={projects} />;
}
