import { auth } from "@clerk/nextjs/server";
import { OrgSelectionShell } from "@/components/organization/org-selection-shell";

export default async function SelectOrganizationLayout({
  children,
}: LayoutProps<"/select-organization">) {
  await auth.protect();

  return <OrgSelectionShell>{children}</OrgSelectionShell>;
}
