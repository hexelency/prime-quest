import AdminRecordsPage from "@/app/(admin)/components/AdminRecordsPage";

const records = [
  { ref: "M-024", title: "EN590 supply requirement", detail: "Buyer mandate · Tema, Ghana · 50,000 MT/month", status: "under review", date: "2026-09-14" },
  { ref: "M-023", title: "Offshore vessel placement", detail: "Seller mandate · West Africa · Authorized representative pending", status: "verification", date: "2026-09-12" },
  { ref: "M-022", title: "Commercial warehouse search", detail: "Buyer mandate · Lagos · Lease or purchase", status: "active", date: "2026-09-10" },
];

export default function AdminMandatesPage() {
  return <AdminRecordsPage eyebrow="Private intake" title="Seller mandates" description="Keep seller submissions, buyer requirements and verification work in one controlled review queue." records={records} />;
}
