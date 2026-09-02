import { isIntegrationAvailable } from "@/lib/integrations/availability";

export type KnowledgeOptionKind =
  | "website"
  | "files"
  | "qna"
  | "help_center"
  | "tickets";

export type KnowledgeTileKind = "native" | "connector" | "group";

export type KnowledgeVendor = {
  id: string;
  label: string;
  vendorSlug: string;
  connectSlug: string;
  available: boolean;
};

export type KnowledgeTileInteraction = "add" | "toggle" | "picker";

export type KnowledgeTile = {
  id: string;
  label: string;
  iconSlug: string;
  kind: KnowledgeTileKind;
  interaction: KnowledgeTileInteraction;
  optionKind?: KnowledgeOptionKind;
  available: boolean;
  vendors?: KnowledgeVendor[];
};

export type FlattenedKnowledgeOption = {
  id: string;
  label: string;
  iconSlug: string;
  optionKind: KnowledgeOptionKind;
  vendorSlug: string | null;
  connectSlug: string | null;
  available: boolean;
  groupLabel?: string;
};

const HELP_CENTER_VENDORS: KnowledgeVendor[] = [
  {
    id: "zendesk-help-center",
    label: "Zendesk",
    vendorSlug: "zendesk",
    connectSlug: "zendesk",
    available: isIntegrationAvailable("zendesk"),
  },
  {
    id: "intercom-help-center",
    label: "Intercom",
    vendorSlug: "intercom",
    connectSlug: "intercom",
    available: isIntegrationAvailable("intercom"),
  },
  {
    id: "freshdesk-help-center",
    label: "Freshdesk",
    vendorSlug: "freshdesk",
    connectSlug: "freshdesk",
    available: isIntegrationAvailable("freshdesk"),
  },
  {
    id: "zoho-help-center",
    label: "Zoho",
    vendorSlug: "zoho_desk",
    connectSlug: "zoho_desk",
    available: isIntegrationAvailable("zoho_desk"),
  },
];

const TICKET_VENDORS: KnowledgeVendor[] = [
  {
    id: "zendesk-tickets",
    label: "Zendesk",
    vendorSlug: "zendesk",
    connectSlug: "zendesk",
    available: isIntegrationAvailable("zendesk"),
  },
  {
    id: "intercom-tickets",
    label: "Intercom",
    vendorSlug: "intercom",
    connectSlug: "intercom",
    available: isIntegrationAvailable("intercom"),
  },
  {
    id: "freshdesk-tickets",
    label: "Freshdesk",
    vendorSlug: "freshdesk",
    connectSlug: "freshdesk",
    available: isIntegrationAvailable("freshdesk"),
  },
  {
    id: "zoho-tickets",
    label: "Zoho",
    vendorSlug: "zoho_desk",
    connectSlug: "zoho_desk",
    available: isIntegrationAvailable("zoho_desk"),
  },
];

export type KnowledgeVendorGroup = {
  id: string;
  label: string;
  optionKind: KnowledgeOptionKind;
  vendors: KnowledgeVendor[];
};

export const KNOWLEDGE_VENDOR_GROUPS: KnowledgeVendorGroup[] = [
  {
    id: "help_centers",
    label: "Help Centers",
    optionKind: "help_center",
    vendors: HELP_CENTER_VENDORS,
  },
  {
    id: "tickets",
    label: "Tickets",
    optionKind: "tickets",
    vendors: TICKET_VENDORS,
  },
];

export const KNOWLEDGE_TILES: KnowledgeTile[] = [
  {
    id: "files",
    label: "Add files",
    iconSlug: "files",
    kind: "native",
    interaction: "add",
    optionKind: "files",
    available: true,
  },
  {
    id: "website",
    label: "Add website",
    iconSlug: "website",
    kind: "native",
    interaction: "add",
    optionKind: "website",
    available: true,
  },
  {
    id: "qna",
    label: "Add Q&A",
    iconSlug: "qna",
    kind: "native",
    interaction: "add",
    optionKind: "qna",
    available: true,
  },
  {
    id: "help_centers",
    label: "Add Help Center",
    iconSlug: "help_centers",
    kind: "group",
    interaction: "picker",
    optionKind: "help_center",
    available: true,
    vendors: HELP_CENTER_VENDORS,
  },
  {
    id: "tickets",
    label: "Add tickets",
    iconSlug: "tickets",
    kind: "group",
    interaction: "picker",
    optionKind: "tickets",
    available: true,
    vendors: TICKET_VENDORS,
  },
  {
    id: "notion",
    label: "Notion",
    iconSlug: "notion",
    kind: "connector",
    interaction: "toggle",
    available: isIntegrationAvailable("notion"),
  },
  {
    id: "google_drive",
    label: "Google Drive",
    iconSlug: "google_drive",
    kind: "connector",
    interaction: "toggle",
    available: isIntegrationAvailable("google_drive"),
  },
  {
    id: "confluence",
    label: "Confluence",
    iconSlug: "confluence",
    kind: "connector",
    interaction: "toggle",
    available: isIntegrationAvailable("confluence"),
  },
];

/** Tiles shown in Show all outside Help Centers / Tickets vendor groups. */
export const SHOW_ALL_OTHER_TILES = KNOWLEDGE_TILES.filter(
  (tile) => tile.kind !== "group"
);

export function knowledgeTileSearchTerms(tile: KnowledgeTile): string[] {
  const terms = [tile.label, tile.iconSlug, tile.optionKind ?? ""];

  if (tile.vendors) {
    for (const vendor of tile.vendors) {
      terms.push(vendor.label, vendor.vendorSlug, vendor.connectSlug, vendor.id);
    }
  }

  return terms.filter(Boolean);
}

export function knowledgeTileMatchesSearch(tile: KnowledgeTile, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return knowledgeTileSearchTerms(tile).some((term) =>
    term.toLowerCase().includes(normalized)
  );
}

export function flattenKnowledgeOptions(): FlattenedKnowledgeOption[] {
  const items: FlattenedKnowledgeOption[] = [];

  for (const tile of KNOWLEDGE_TILES) {
    if (tile.kind === "group" && tile.vendors && tile.optionKind) {
      for (const vendor of tile.vendors) {
        items.push({
          id: vendor.id,
          label: `${vendor.label} ${tile.optionKind === "tickets" ? "Tickets" : "Help Center"}`,
          iconSlug: vendor.vendorSlug,
          optionKind: tile.optionKind,
          vendorSlug: vendor.vendorSlug,
          connectSlug: vendor.connectSlug,
          available: vendor.available,
          groupLabel: tile.label,
        });
      }
      continue;
    }

    items.push({
      id: tile.id,
      label: tile.label,
      iconSlug: tile.iconSlug,
      optionKind: tile.optionKind ?? "website",
      vendorSlug: tile.kind === "connector" ? tile.iconSlug : null,
      connectSlug: tile.kind === "connector" ? tile.iconSlug : null,
      available: tile.available,
    });
  }

  return items;
}

export function nativeSourceId(kind: KnowledgeOptionKind) {
  return `src_${kind}`;
}

export function primaryVendor(tile: KnowledgeTile) {
  return tile.vendors?.find((vendor) => vendor.available);
}

export function tileSourceId(tile: KnowledgeTile) {
  if (tile.optionKind && tile.kind === "group") {
    const vendor = primaryVendor(tile);
    return vendor ? connectorSourceId(tile.optionKind, vendor.vendorSlug) : null;
  }

  if (tile.optionKind && tile.kind === "native") {
    return nativeSourceId(tile.optionKind);
  }

  return null;
}

export function connectorSourceId(
  optionKind: KnowledgeOptionKind,
  vendorSlug: string
) {
  return `src_${vendorSlug}_${optionKind}`;
}
