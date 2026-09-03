"use client";

import { useEffect, useState } from "react";
import { OrganizationList, useClerk, useOrganization } from "@clerk/nextjs";

export function SelectOrganizationPage() {
  const clerk = useClerk();
  const { isLoaded } = useOrganization();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    let cancelled = false;

    const prepareSelection = async () => {
      try {
        if (clerk.organization?.id) {
          await clerk.setActive({ organization: null });
          await clerk.session?.reload();
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void prepareSelection();

    return () => {
      cancelled = true;
    };
  }, [clerk, isLoaded]);

  if (!isLoaded || !isReady) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="mx-auto h-10 w-full max-w-sm animate-pulse rounded-lg bg-muted" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="mx-auto w-full max-w-sm">
        <OrganizationList
          hidePersonal
          skipInvitationScreen
          afterSelectOrganizationUrl="/"
          afterCreateOrganizationUrl="/"
          appearance={{
            elements: {
              rootBox: {
                width: "100%",
                maxWidth: "100%",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
              },
              card: "mx-auto w-full shadow-none border-0 bg-transparent",
              cardBox: "mx-auto w-full",
            },
          }}
        />
      </div>
    </main>
  );
}
