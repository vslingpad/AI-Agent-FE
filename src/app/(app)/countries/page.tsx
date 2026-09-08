import { Suspense } from "react";
import {
  CountriesPage,
  CountriesPageSkeleton,
} from "@/components/dashboard/countries-page";

export default function Page() {
  return (
    <Suspense fallback={<CountriesPageSkeleton />}>
      <CountriesPage />
    </Suspense>
  );
}
