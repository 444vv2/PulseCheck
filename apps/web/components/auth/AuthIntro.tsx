import { Brand } from "../ui/Brand";
import { Eyebrow } from "../ui/Eyebrow";
import styles from "./AuthIntro.module.css";

export function AuthIntro() {
  return (
    <section className={styles.intro}>
      <Brand href="/login" theme="dark" />
      <div>
        <Eyebrow>AVAILABILITY, WITHOUT GUESSWORK</Eyebrow>
        <h1>
          Your services —<br />
          under close monitoring.
        </h1>
        <p className={styles.copy}>
          Track your websites and APIs in one quiet, understandable space.
        </p>
      </div>
      <div className={styles.signalCard}>
        <span className={styles.signalDot} />
        <div>
          <strong>Everything under control</strong>
          <small>Status checks every minute</small>
        </div>
      </div>
    </section>
  );
}
