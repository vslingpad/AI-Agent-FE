let cached: BrowserLocation | null | undefined;

export type BrowserLocation = {
  city?: string;
  country?: string;
  location?: string;
};

function fromParts(city?: string, country?: string): BrowserLocation | null {
  const nextCity = city?.trim() || undefined;
  const nextCountry = country?.trim() || undefined;
  if (!nextCity && !nextCountry) {
    return null;
  }
  return {
    city: nextCity,
    country: nextCountry,
    location: [nextCity, nextCountry].filter(Boolean).join(", "),
  };
}

export async function detectBrowserLocation(): Promise<BrowserLocation | null> {
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) {
      cached = null;
      return null;
    }
    const data = (await response.json()) as {
      city?: unknown;
      country_code?: unknown;
    };
    cached = fromParts(
      typeof data.city === "string" ? data.city : undefined,
      typeof data.country_code === "string" ? data.country_code : undefined
    );
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
