import type { StaticImageData } from "next/image";
import calendly from "./calendly.svg";
import confluence from "./confluence.svg";
import freshdesk from "./freshdesk.svg";
import googleDrive from "./google_drive.svg";
import gorgias from "./gorgias.svg";
import hubspot from "./hubspot.svg";
import intercom from "./intercom.svg";
import notion from "./notion.svg";
import shopify from "./shopify.svg";
import stripe from "./stripe.svg";
import zendesk from "./zendesk.svg";
import zoho from "./zoho.svg";

export type BrandIconSlug =
  | "zendesk"
  | "notion"
  | "google_drive"
  | "confluence"
  | "intercom"
  | "freshdesk"
  | "zoho"
  | "calendly"
  | "stripe"
  | "hubspot"
  | "shopify"
  | "gorgias";

export const NATIVE_KNOWLEDGE_ICON_SLUGS = new Set([
  "files",
  "website",
  "qna",
  "help_centers",
  "help_center",
  "tickets",
]);

const BRAND_ICON_ASSETS: Record<BrandIconSlug, StaticImageData> = {
  zendesk,
  notion,
  google_drive: googleDrive,
  confluence,
  intercom,
  freshdesk,
  zoho,
  calendly,
  stripe,
  hubspot,
  shopify,
  gorgias,
};

const BRAND_ICON_ALIASES: Record<string, BrandIconSlug> = {
  zoho_desk: "zoho",
};

export function normalizeIconSlug(slug: string) {
  if (slug.startsWith("zendesk")) {
    return "zendesk";
  }

  if (slug === "help_center") {
    return "help_centers";
  }

  return slug;
}

export function resolveBrandIconSlug(slug: string): BrandIconSlug | null {
  const normalized = normalizeIconSlug(slug);

  if (normalized in BRAND_ICON_ASSETS) {
    return normalized as BrandIconSlug;
  }

  return BRAND_ICON_ALIASES[normalized] ?? null;
}

export function getBrandIconSrc(slug: string): string | null {
  const brandSlug = resolveBrandIconSlug(slug);

  if (!brandSlug) {
    return null;
  }

  return BRAND_ICON_ASSETS[brandSlug].src;
}

export function isNativeKnowledgeIconSlug(slug: string) {
  return NATIVE_KNOWLEDGE_ICON_SLUGS.has(normalizeIconSlug(slug));
}

export function isBrandIconSlug(slug: string) {
  return resolveBrandIconSlug(slug) !== null;
}
