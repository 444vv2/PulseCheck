"use client";

import { FormEvent, InputHTMLAttributes, useState } from "react";
import styles from "./InlineEditableText.module.css";

interface InlineEditableTextProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onSave: (newValue: string) => Promise<boolean> | boolean;
  textClassName?: string;
}

export function InlineEditableText({
  value,
  onSave,
  textClassName,
  ...inputProps
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  function startEditing() {
    setDraft(value);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(value);
    setIsEditing(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    const ok = await onSave(trimmed);
    setIsSaving(false);
    if (ok) setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form className={styles.form} onSubmit={submit}>
        <input
          {...inputProps}
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancelEditing();
          }}
          autoFocus
          disabled={isSaving}
        />
        <button
          type="submit"
          className={styles.saveButton}
          aria-label="Save"
          disabled={isSaving}
        >
          ✓
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          aria-label="Cancel"
          onClick={cancelEditing}
        >
          ×
        </button>
      </form>
    );
  }

  return (
    <span className={styles.wrapper}>
      <span className={`${styles.text} ${textClassName ?? ""}`}>{value}</span>
      <button
        type="button"
        className={styles.editButton}
        aria-label="Edit"
        onClick={startEditing}
      >
        ✎
      </button>
    </span>
  );
}
