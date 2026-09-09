import { Suspense } from "react";
import {
  AiQualityPage,
  AiQualityPageSkeleton,
} from "@/components/dashboard/ai-quality-page";

export default function Page() {
  return (
    <Suspense fallback={<AiQualityPageSkeleton />}>
      <AiQualityPage />
    </Suspense>
  );
}
