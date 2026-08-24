import { BuildPageShell } from "@/components/build/build-page-shell";

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuildPageShell
      enableSearch
      searchPlaceholder="Search integrations…"
    >
      {children}
    </BuildPageShell>
  );
}
