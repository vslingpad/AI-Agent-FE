import { BuildPageShell } from "@/components/build/build-page-shell";

export default function ActionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BuildPageShell>{children}</BuildPageShell>;
}
