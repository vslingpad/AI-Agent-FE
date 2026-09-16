"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      closeButton
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
