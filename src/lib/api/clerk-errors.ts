import { NextResponse } from "next/server";
import {
  isClerkAPIResponseError,
  type ClerkAPIResponseError,
} from "@clerk/backend/errors";

export function getClerkErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
) {
  if (isClerkAPIResponseError(error)) {
    const clerkError = error as ClerkAPIResponseError;

    if (clerkError.errors.length > 0) {
      const first = clerkError.errors[0];
      return first.longMessage || first.message || fallback;
    }

    if (clerkError.message) {
      return clerkError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function clerkErrorResponse(error: unknown, status?: number) {
  const resolvedStatus =
    status ??
    (isClerkAPIResponseError(error) ? error.status : undefined) ??
    400;

  return NextResponse.json(
    { error: getClerkErrorMessage(error) },
    { status: resolvedStatus }
  );
}
