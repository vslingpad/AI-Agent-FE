import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Suppress the global mutation error toast for this mutation. */
      skipErrorToast?: boolean;
    };
  }
}
