export type BuildSectionKey = "agents" | "integrations" | "actions";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const BUILD_SECTIONS: Record<
  BuildSectionKey,
  { label: string; href: string }
> = {
  agents: { label: "Agents", href: "/agents" },
  integrations: { label: "Integrations", href: "/integrations" },
  actions: { label: "Actions", href: "/actions" },
};

export function getBuildSectionFromPath(pathname: string): BuildSectionKey | null {
  if (pathname === "/agents" || pathname.startsWith("/agents/")) {
    return "agents";
  }

  if (pathname === "/integrations" || pathname.startsWith("/integrations/")) {
    return "integrations";
  }

  if (pathname === "/actions" || pathname.startsWith("/actions/")) {
    return "actions";
  }

  return null;
}

export function resolveBuildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const section = getBuildSectionFromPath(pathname);

  if (!section) {
    return [];
  }

  const root = BUILD_SECTIONS[section];
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    return [{ label: root.label }];
  }

  const crumbs: BreadcrumbItem[] = [{ label: root.label, href: root.href }];

  if (section === "integrations") {
    if (segments[1] === "new" && segments[2]) {
      const slug = segments[2];
      const name = slug.charAt(0).toUpperCase() + slug.slice(1);
      crumbs.push({ label: `Connect ${name}` });
      return crumbs;
    }

    if (segments.length >= 3 && segments[1] !== "new") {
      crumbs.push({ label: "Loading…" });
      return crumbs;
    }
  }

  if (section === "actions" && segments[1] === "custom") {
    crumbs.push({ label: "Custom actions" });
    return crumbs;
  }

  if (section === "agents" && segments.length >= 2) {
    crumbs.push({ label: "Agent" });
    return crumbs;
  }

  return crumbs;
}
