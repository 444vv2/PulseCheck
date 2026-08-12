import Link from "next/link";
import styles from "./Brand.module.css";

export function Brand({
  href = "/dashboard",
  theme = "dark",
}: {
  href?: string;
  theme?: "dark" | "light";
}) {
  return (
    <Link
      className={`${styles.brand} ${theme === "light" ? styles.light : styles.dark}`}
      href={href}
    >
      <span>◉</span> PulseCheck
    </Link>
  );
}
