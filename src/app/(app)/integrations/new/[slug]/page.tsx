import { ConnectWizardPage } from "@/components/integrations/connect-wizard-page";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function NewIntegrationPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  return <ConnectWizardPage slug={slug} from={from} />;
}
