"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "../ui/Brand";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⌁", label: "Dashboard" },
  { href: "/activity", icon: "◷", label: "Activity" },
];

export function Sidebar({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Brand href="/dashboard" theme="light" />
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
          >
            {item.icon} <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.bottom}>
        <div className={styles.avatar}>{email.slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>{email}</strong>
          <button className={styles.signOutButton} onClick={onSignOut}>
            Вийти
          </button>
        </div>
      </div>
    </aside>
  );
}
