import { ConnectWizardPage } from "@/components/integrations/connect-wizard-page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewIntegrationPage({ params }: PageProps) {
  const { slug } = await params;
  return <ConnectWizardPage slug={slug} />;
}
