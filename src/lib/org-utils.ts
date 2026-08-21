export function getOrgInitials(name?: string | null) {
  if (!name) {
    return "??";
  }

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function formatPlanLabel(planName?: string | null) {
  if (!planName) {
    return "Free plan";
  }

  return planName.toLowerCase().includes("plan")
    ? planName
    : `${planName} plan`;
}
