import { INTEGRATION_CATALOG } from "@/lib/fixtures/integrations-store";
import type { IntegrationCatalogItem } from "@/lib/schemas/integrations";

export function getIntegrationCatalogItem(
  slug: string,
  catalog: IntegrationCatalogItem[] = INTEGRATION_CATALOG
) {
  return catalog.find((item) => item.slug === slug);
}

export function isIntegrationAvailable(
  slug: string,
  catalog: IntegrationCatalogItem[] = INTEGRATION_CATALOG
) {
  return getIntegrationCatalogItem(slug, catalog)?.available ?? false;
}
