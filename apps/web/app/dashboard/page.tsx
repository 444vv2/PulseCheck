'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type Monitor = {
  id: string;
  url: string;
  intervalSec: number;
  isActive: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function formatInterval(seconds: number) {
  return seconds % 60 === 0 ? `${seconds / 60} хв` : `${seconds} с`;
}

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [intervalSec, setIntervalSec] = useState(300);
  const [status, setStatus] = useState('Увійдіть, щоб побачити свої монітори.');
  const [hasToken, setHasToken] = useState(false);

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = localStorage.getItem('pulsecheck.accessToken');
    if (!token) throw new Error('Потрібно увійти до акаунта.');

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
    });
    const data = await response.json().catch(() => null) as { message?: string } | null;
    if (!response.ok) throw new Error(data?.message ?? 'Запит не виконано.');
    return { response, data };
  }, []);

  const loadMonitors = useCallback(async () => {
    try {
      const { data } = await request('/monitors?page=1&limit=20');
      const response = data as unknown as { items: Monitor[] };
      setMonitors(response.items);
      setStatus(response.items.length ? 'Дані оновлено щойно.' : 'Додайте перший endpoint для моніторингу.');
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Не вдалося завантажити монітори.');
    }
  }, [request]);

  useEffect(() => {
    const token = localStorage.getItem('pulsecheck.accessToken');
    setHasToken(Boolean(token));
    setEmail(localStorage.getItem('pulsecheck.email') ?? 'Гість');
    if (token) void loadMonitors();
  }, [loadMonitors]);

  async function addMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await request('/monitors', { method: 'POST', body: JSON.stringify({ url, intervalSec }) });
      setUrl('');
      setIntervalSec(300);
      await loadMonitors();
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Не вдалося створити монітор.');
    }
  }

  async function toggleMonitor(monitor: Monitor) {
    try {
      await request(`/monitors/${monitor.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !monitor.isActive }) });
      await loadMonitors();
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Не вдалося оновити монітор.');
    }
  }

  async function deleteMonitor(id: string) {
    try {
      await request(`/monitors/${id}`, { method: 'DELETE' });
      await loadMonitors();
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'Не вдалося видалити монітор.');
    }
  }

  function signOut() {
    localStorage.removeItem('pulsecheck.accessToken');
    localStorage.removeItem('pulsecheck.email');
    window.location.assign('/login');
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard"><span>◉</span> PulseCheck</Link>
        <nav><a className="nav-item active" href="#monitors">⌁ <span>Монітори</span></a><a className="nav-item" href="#activity">◷ <span>Активність</span></a><a className="nav-item" href="#settings">⚙ <span>Налаштування</span></a></nav>
        <div className="sidebar-bottom"><div className="avatar">{email.slice(0, 1).toUpperCase()}</div><div><strong>{email}</strong><button onClick={signOut}>Вийти</button></div></div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header"><div><p className="eyebrow">MONITORING OVERVIEW</p><h1>Доброго дня, {email.split('@')[0]}.</h1><p>Ось що відбувається з вашими endpoint’ами.</p></div><span className="live-badge"><i /> LIVE</span></header>

        <section className="stats-grid">
          <article><span>УСІ МОНІТОРИ</span><strong>{monitors.length}</strong><small>У вашому просторі</small></article>
          <article><span>АКТИВНІ</span><strong>{monitors.filter((monitor) => monitor.isActive).length}</strong><small className="positive">● Готові до перевірки</small></article>
          <article><span>ПАУЗА</span><strong>{monitors.filter((monitor) => !monitor.isActive).length}</strong><small>Можна відновити будь-коли</small></article>
        </section>

        <section id="monitors" className="monitor-section">
          <div className="section-heading"><div><h2>Ваші монітори</h2><p>{status}</p></div><button className="outline-button" onClick={() => void loadMonitors()} disabled={!hasToken}>Оновити</button></div>
          {!hasToken && <div className="notice"><strong>Дашборд готовий.</strong> Увійдіть, щоби підключити його до API. <Link href="/login">До входу →</Link></div>}
          {hasToken && <form className="add-monitor" onSubmit={addMonitor}><input aria-label="URL монітора" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://api.example.com/health" required /><label>Інтервал<select value={intervalSec} onChange={(event) => setIntervalSec(Number(event.target.value))}><option value={60}>1 хв</option><option value={300}>5 хв</option><option value={900}>15 хв</option></select></label><button className="primary-button">Додати монітор</button></form>}
          <div className="monitor-list">
            {monitors.map((monitor) => <article className="monitor-row" key={monitor.id}><span className={`status-dot ${monitor.isActive ? 'up' : 'paused'}`} /><div className="monitor-main"><strong>{monitor.url}</strong><small>Перевірка кожні {formatInterval(monitor.intervalSec)} · {monitor.lastCheckedAt ? `останній запит ${new Date(monitor.lastCheckedAt).toLocaleString('uk-UA')}` : 'ще не перевірявся'}</small></div><span className={`state ${monitor.isActive ? 'state-up' : ''}`}>{monitor.isActive ? 'Активний' : 'На паузі'}</span><button className="text-button" onClick={() => void toggleMonitor(monitor)}>{monitor.isActive ? 'Пауза' : 'Запустити'}</button><button className="delete-button" aria-label={`Видалити ${monitor.url}`} onClick={() => void deleteMonitor(monitor.id)}>×</button></article>)}
            {hasToken && !monitors.length && <div className="empty-state">Тут з’являться ваші монітори після додавання.</div>}
          </div>
        </section>
      </section>
    </main>
  );
}
