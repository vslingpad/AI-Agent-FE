import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await auth.protect();

  return <AppShell>{children}</AppShell>;
}
