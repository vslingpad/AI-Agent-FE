import { INTEGRATION_CATALOG } from "@/lib/fixtures/integrations-store";

export type DeployChannelDefinition = {
  id: string;
  label: string;
  description: string;
  iconSlug: string;
  connectSlug: string | null;
  available: boolean;
};

export const EXTRA_DEPLOY_CHANNELS: DeployChannelDefinition[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Reply to customers on WhatsApp.",
    iconSlug: "whatsapp",
    connectSlug: "whatsapp",
    available: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Reply to customers on Instagram Direct.",
    iconSlug: "instagram",
    connectSlug: "instagram",
    available: false,
  },
];

export function getDeployChannelDefinitions(): DeployChannelDefinition[] {
  const fromCatalog = INTEGRATION_CATALOG.filter((item) =>
    item.capabilities.includes("channel")
  )
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      id: item.slug,
      label: item.name,
      description: item.description,
      iconSlug: item.slug,
      connectSlug: item.slug,
      available: item.available,
    }));

  return [...fromCatalog, ...EXTRA_DEPLOY_CHANNELS];
}

export const DEPLOY_CHANNEL_DEFINITIONS = getDeployChannelDefinitions();
