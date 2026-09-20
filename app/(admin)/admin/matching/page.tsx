import MatchingWorkspace from "./MatchingWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminMatchingPage({ searchParams }: { searchParams?: Promise<{ buyerRequestId?: string; sellerMandateId?: string }> }) {
  return <MatchingWorkspace buyerRequestId={(await searchParams)?.buyerRequestId} sellerMandateId={(await searchParams)?.sellerMandateId} />;
}
