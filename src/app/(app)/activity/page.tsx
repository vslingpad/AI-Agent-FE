import { Suspense } from "react";
import {
  ActivityPage,
  ActivityPageSkeleton,
} from "@/components/dashboard/activity-page";

export default function Page() {
  return (
    <Suspense fallback={<ActivityPageSkeleton />}>
      <ActivityPage />
    </Suspense>
  );
}
