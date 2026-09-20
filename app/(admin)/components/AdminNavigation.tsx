"use client";

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
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="Admin navigation">
      <a className={styles.logo} href="/admin" aria-label="PrimeQuest admin home"><span className={styles.logoMark}>PQ</span><span><strong>PRIMEQUEST</strong><small>OPERATIONS DESK</small></span></a>
      <div className={styles.workspaceLabel}>Workspace</div>
      <nav className={styles.nav}>{links.map(([number, label, href]) => { const badge = label === "Inquiries" ? counts.pendingInquiries : label === "Seller mandates" ? counts.pendingMandates : label === "Matched opportunities" ? counts.pendingMatches : label === "Meetings" ? counts.pendingMeetings : 0; return <a className={pathname === href ? styles.navItemActive : styles.navItem} href={href} key={href}><span className={styles.navIcon}>{number}</span>{label}{badge > 0 && <strong className={styles.notificationBadge}>{badge > 99 ? "99+" : badge}</strong>}</a>; })}</nav>
      <div className={styles.sidebarFooter}><div className={styles.demoBadge}>Live operations</div><a href="/">View public site <span>↗</span></a></div>
    </aside>
    <button className={styles.mobileToggle} type="button" aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}><span /><span /><span /></button>
    {mobileOpen && <button className={styles.backdrop} type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} />}
    <div className={styles.content}>{children}</div>
    <AdminAiAssistant pathname={pathname} />
  </div>;
}
