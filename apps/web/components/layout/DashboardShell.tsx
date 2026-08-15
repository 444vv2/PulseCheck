"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAuthSession } from "../../hooks/useAuthSession";
import styles from "./DashboardShell.module.css";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { email, hasToken, signOut } = useAuthSession();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <main className={styles.shell}>
      <Sidebar email={email} hasToken={hasToken} onSignOut={handleSignOut} />
      <section className={styles.content}>{children}</section>
    </main>
  );
}
