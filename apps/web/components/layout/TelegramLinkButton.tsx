"use client";

import { useTelegramLink } from "../../hooks/useTelegramLink";
import styles from "./TelegramLinkButton.module.css";

export function TelegramLinkButton({ hasToken }: { hasToken: boolean }) {
  const { linked, isLoading, generateLink, unlink } = useTelegramLink(hasToken);

  async function handleClick() {
    if (linked) {
      await unlink();
      return;
    }
    const link = await generateLink();
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  }

  if (!hasToken) return null;

  return (
    <button
      className={styles.button}
      onClick={handleClick}
      disabled={isLoading}
    >
      <span className={`${styles.dot} ${linked ? styles.dotOn : ""}`} />
      {linked ? "Telegram linked · unlink" : "Link Telegram"}
    </button>
  );
}
