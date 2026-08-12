"use client";

import { FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import styles from "./AddMonitorForm.module.css";

const INTERVAL_OPTIONS = [
  { value: 60, label: "1 min" },
  { value: 120, label: "2 min" },
  { value: 300, label: "5 min" },
  { value: 900, label: "15 min" },
];

export function AddMonitorForm({
  onSubmit,
}: {
  onSubmit: (url: string, intervalSec: number) => Promise<boolean>;
}) {
  const [url, setUrl] = useState("");
  const [intervalSec, setIntervalSec] = useState(300);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await onSubmit(url, intervalSec);
    if (ok) {
      setUrl("");
      setIntervalSec(300);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        aria-label="Monitor URL"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://api.example.com/health"
        required
      />
      <label className={styles.label}>
        Interval
        <select
          value={intervalSec}
          onChange={(event) => setIntervalSec(Number(event.target.value))}
        >
          {INTERVAL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Button className={styles.submit}>Add Monitor</Button>
    </form>
  );
}
