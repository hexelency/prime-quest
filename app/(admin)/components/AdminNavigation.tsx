"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./admin-navigation.module.css";
import AdminAiAssistant from "./AdminAiAssistant";
import responsiveStyles from "./admin-responsive.module.css";

const links = [
  ["01", "Overview", "/admin"],
  ["02", "Listings", "/admin/listings"],
  ["03", "Seller mandates", "/admin/mandates"],
  ["04", "Inquiries", "/admin/inquiries"],
  ["05", "Matched opportunities", "/admin/matches"],
  ["06", "Meetings", "/admin/meetings"],
  ["07", "Closed deals", "/admin/deals"],
  ["08", "Lead intelligence", "/admin/leads"],
  ["09", "AI control center", "/admin/ai"],
  ["10", "Agent tasks", "/admin/ai/tasks"],
] as const;

export default function AdminNavigation({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ pendingInquiries: 0, pendingMandates: 0, pendingMatches: 0, pendingMeetings: 0 });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", closeOnEscape); };
  }, [mobileOpen]);

  useEffect(() => {
    fetch("/api/admin/overview").then((response) => response.json()).then((result: { counts?: Partial<typeof counts> }) => setCounts((current) => ({ ...current, ...result.counts }))).catch(() => setCounts({ pendingInquiries: 0, pendingMandates: 0, pendingMatches: 0, pendingMeetings: 0 }));
  }, [pathname]);

  return <div className={`${styles.shell} ${responsiveStyles.root}`}>
    <aside id="admin-navigation-drawer" className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="Admin navigation">
      
      <div className={styles.workspaceLabel}>Workspace</div>
      <nav className={styles.nav}>{links.map(([number, label, href]) => { const badge = label === "Inquiries" ? counts.pendingInquiries : label === "Seller mandates" ? counts.pendingMandates : label === "Matched opportunities" ? counts.pendingMatches : label === "Meetings" ? counts.pendingMeetings : 0; return <a className={pathname === href ? styles.navItemActive : styles.navItem} href={href} key={href}><span className={styles.navIcon}>{number}</span>{label}{badge > 0 && <strong className={styles.notificationBadge}>{badge > 99 ? "99+" : badge}</strong>}</a>; })}</nav>
      <div className={styles.sidebarFooter}><div className={styles.demoBadge}>Live operations</div><a href="/">View public site <span>↗</span></a></div>
    </aside>
    <div className={styles.mobileHeader}>
      <a className={styles.logo} href="/admin" aria-label="PrimeQuest admin home"><Image className="admin-brand-logo" src="/logo/official-logo.png" alt="" width={150} height={150} /><span><strong>PRIMEQUEST</strong><small>OPERATIONS DESK</small></span></a>
      <button className={styles.mobileToggle} type="button" aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"} aria-controls="admin-navigation-drawer" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}><span /><span /><span /></button>
    </div>
    {mobileOpen && <button className={styles.backdrop} type="button" aria-label="Close navigation backdrop" onClick={() => setMobileOpen(false)} />}
    <div className={styles.content}>{children}</div>
    <AdminAiAssistant pathname={pathname} />
  </div>;
}
