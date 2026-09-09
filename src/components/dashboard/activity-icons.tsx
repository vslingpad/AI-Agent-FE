import {
  ClipboardListIcon,
  FileTextIcon,
  LightbulbIcon,
  LinkIcon,
} from "lucide-react";
import type { ActivityIcon } from "@/lib/schemas/dashboard";

export const ACTIVITY_ICONS = {
  document: FileTextIcon,
  lightbulb: LightbulbIcon,
  link: LinkIcon,
  clipboard: ClipboardListIcon,
} as const;

export const ACTIVITY_ICON_LABELS: Record<ActivityIcon, string> = {
  document: "Procedures",
  lightbulb: "Knowledge",
  link: "Integrations",
  clipboard: "Tests",
};
