import { isClerkAPIResponseError } from "@clerk/backend/errors";
import { ApiError } from "@/lib/api/client";

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/**
 * Maps mutation failures to copy safe for end users.
 * Never surfaces raw API messages, stack traces, or infrastructure details.
 */
export function getUserFacingMutationError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return "Please sign in again to continue.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "We couldn't find what you're looking for.";
      case 409:
        return "This action conflicts with something that already exists. Try a different option or refresh the page.";
      case 422:
        return "Some information was invalid. Please review and try again.";
      case 429:
        return "Too many attempts. Please wait a moment and try again.";
      default:
        if (error.status >= 500) {
          return "We're having trouble completing this right now. Please try again later.";
        }
        return "We couldn't complete that action. Please try again.";
    }
  }

  if (isClerkAPIResponseError(error)) {
    return "We couldn't complete that action. Please try again.";
  }

  if (error instanceof Error) {
    return DEFAULT_MESSAGE;
  }

  return DEFAULT_MESSAGE;
}
