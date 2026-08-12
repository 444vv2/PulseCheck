"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./ResponseTimeChart.module.css";

type PingResult = { checkedAt: string; responseTimeMs: number; isUp: boolean };

type ChartPoint = {
  time: string;
  timestamp: number;
  primary?: number;
  compare?: number;
};

function buildChartData(
  primary: PingResult[],
  compare: PingResult[],
): ChartPoint[] {
  const map = new Map<string, ChartPoint>();

  function addSeries(points: PingResult[], key: "primary" | "compare") {
    points.forEach((point) => {
      const date = new Date(point.checkedAt);
      const label = date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const existing = map.get(label) ?? {
        time: label,
        timestamp: date.getTime(),
      };
      existing[key] = point.responseTimeMs;
      map.set(label, existing);
    });
  }

  addSeries(primary, "primary");
  addSeries(compare, "compare");

  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export function ResponseTimeChart({
  results,
  compareResults = [],
  primaryLabel = "Selected monitor",
  compareLabel = "Compare monitor",
}: {
  results: PingResult[];
  compareResults?: PingResult[];
  primaryLabel?: string;
  compareLabel?: string;
}) {
  const hasCompare = compareResults.length > 0;
  const chartData = buildChartData(results, compareResults);

  return (
    <div className={styles.card}>
      {chartData.length === 0 ? (
        <p className={styles.empty}>No data available for this monitor.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(170, 172, 161, 0.24)"
            />
            <XAxis dataKey="time" stroke="#7c8685" fontSize={12} />
            <YAxis
              stroke="#7c8685"
              fontSize={12}
              label={{
                value: "ms",
                angle: -90,
                position: "insideLeft",
                fill: "#7c8685",
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#f1f0ea",
                border: "1px solid rgba(54, 46, 45, 0.14)",
                borderRadius: "4px",
                fontSize: "0.82rem",
              }}
            />
            {hasCompare && <Legend wrapperStyle={{ fontSize: "0.78rem" }} />}
            <Line
              type="monotone"
              dataKey="primary"
              name={primaryLabel}
              stroke="#e3311d"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            {hasCompare && (
              <Line
                type="monotone"
                dataKey="compare"
                name={compareLabel}
                stroke="#7c8685"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
