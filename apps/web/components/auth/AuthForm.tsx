"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthIntro } from "./AuthIntro";
import { PasswordInput } from "../ui/PasswordInput";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { useAuthSession } from "../../hooks/useAuthSession";
import styles from "./AuthForm.module.css";

type Mode = "login" | "register";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => null)) as {
        accessToken?: string;
        user?: { email?: string };
        message?: string;
      } | null;

      if (!response.ok || !data?.accessToken) {
        throw new Error(data?.message ?? "Failed to authenticate.");
      }

      login(data.accessToken, data.user?.email ?? email);
      router.push("/dashboard");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Failed to authenticate.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.layout}>
      <AuthIntro />
      <section className={styles.panel}>
        <form className={styles.form} onSubmit={submit}>
          <Eyebrow>{isLogin ? "WELCOME BACK" : "START MONITORING"}</Eyebrow>
          <h2>{isLogin ? "Sign In" : "Create Account"}</h2>
          <p className={styles.note}>
            {isLogin
              ? "We're glad to see you again."
              : "The first steps will take less than a minute."}
          </p>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button
            className={styles.submit}
            fullWidth
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Waiting…"
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </Button>
          <p className={styles.switch}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link href={isLogin ? "/register" : "/login"}>
              {isLogin ? "Register" : "Sign In"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
