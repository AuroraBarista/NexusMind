import { Dashboard } from "@/components/Dashboard";

interface DashboardPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const params = await searchParams;
    const projectName = typeof params?.project === 'string' ? params.project : undefined;

    // We construct a partial project object. ID is not strictly needed for the initial state logic 
    // which primarily relies on the name.
    const initialProject = projectName ? { id: 'from-url', name: projectName } : undefined;

    return <Dashboard initialProject={initialProject} />;
}
