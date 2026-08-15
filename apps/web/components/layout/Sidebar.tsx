"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "../ui/Brand";
import { TelegramLinkButton } from "./TelegramLinkButton";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⌁", label: "Дашборд" },
  { href: "/activity", icon: "◷", label: "Активність" },
];

export function Sidebar({
  email,
  hasToken,
  onSignOut,
}: {
  email: string;
  hasToken: boolean;
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
        <TelegramLinkButton hasToken={hasToken} />
        <div className={styles.bottomRow}>
          <div className={styles.avatar}>{email.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{email}</strong>
            <button className={styles.signOutButton} onClick={onSignOut}>
              Leave
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
