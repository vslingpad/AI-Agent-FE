import { BuildPageShell } from "@/components/build/build-page-shell";
import { AgentsListPage } from "@/components/agents/agents-list-page";

export default function AgentsPage() {
  return (
    <BuildPageShell enableSearch searchPlaceholder="Search agents…">
      <AgentsListPage />
    </BuildPageShell>
  );
}
