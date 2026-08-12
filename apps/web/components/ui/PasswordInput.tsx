"use client";

import { InputHTMLAttributes, useState } from "react";
import styles from "./PasswordInput.module.css";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "🙈" : "👁"}
      </button>
    </div>
  );
}
