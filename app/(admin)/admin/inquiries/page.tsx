import AdminRecordsPage from "@/app/(admin)/components/AdminRecordsPage";

const records = [
  { ref: "INQ-118", title: "Vessel details requested", detail: "Buyer inquiry · Offshore Support Vessel · WhatsApp", status: "new", date: "2026-09-15" },
  { ref: "INQ-117", title: "Land opportunity follow-up", detail: "Investor inquiry · Asaba · Email", status: "assigned", date: "2026-09-14" },
  { ref: "INQ-116", title: "Submit vessel mandate", detail: "Owner inquiry · Commercial vessel · Web form", status: "open", date: "2026-09-13" },
];

export default function AdminInquiriesPage() {
  return <AdminRecordsPage eyebrow="Relationship desk" title="Inquiries" description="Track buyer interest, seller questions and the next human action required for each conversation." records={records} />;
}
