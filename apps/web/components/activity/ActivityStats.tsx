import styles from "./ActivityStats.module.css";

type PingResult = { checkedAt: string; responseTimeMs: number; isUp: boolean };

function computeStats(results: PingResult[]) {
  if (!results.length) return null;

  const upCount = results.filter((r) => r.isUp).length;
  const uptime = (upCount / results.length) * 100;
  const times = results.map((r) => r.responseTimeMs);
  const avg = times.reduce((sum, t) => sum + t, 0) / times.length;

  return {
    uptime,
    avg,
    min: Math.min(...times),
    max: Math.max(...times),
    total: results.length,
  };
}

export function ActivityStats({ results }: { results: PingResult[] }) {
  const stats = computeStats(results);
  if (!stats) return null;

  const uptimeClass =
    stats.uptime >= 99
      ? styles.up
      : stats.uptime < 95
        ? styles.down
        : undefined;

  return (
    <section className={styles.grid}>
      <article className={uptimeClass}>
        <span>UPTIME</span>
        <strong>{stats.uptime.toFixed(1)}%</strong>
      </article>
      <article>
        <span>Average Response Time</span>
        <strong>{Math.round(stats.avg)} ms</strong>
      </article>
      <article>
        <span>MIN / MAX</span>
        <strong>
          {stats.min} / {stats.max} ms
        </strong>
      </article>
      <article>
        <span>Checks in Selection</span>
        <strong>{stats.total}</strong>
      </article>
    </section>
  );
}
