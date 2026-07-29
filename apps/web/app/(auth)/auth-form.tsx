'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === 'login';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => null)) as
        | { accessToken?: string; user?: { email?: string }; message?: string }
        | null;

      if (!response.ok || !data?.accessToken) {
        throw new Error(data?.message ?? 'Не вдалося виконати запит.');
      }

      localStorage.setItem('pulsecheck.accessToken', data.accessToken);
      localStorage.setItem('pulsecheck.email', data.user?.email ?? email);
      router.push('/dashboard');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Сталася неочікувана помилка.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <Link className="brand" href="/login"><span>◉</span> PulseCheck</Link>
        <div>
          <p className="eyebrow">AVAILABILITY, WITHOUT GUESSWORK</p>
          <h1>Ваші сервіси —<br />під пильним наглядом.</h1>
          <p className="intro-copy">Відстежуйте вебсайти й API в одному тихому, зрозумілому просторі.</p>
        </div>
        <div className="signal-card">
          <span className="signal-dot" />
          <div><strong>Усе під контролем</strong><small>Перевірка статусу щохвилини</small></div>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <p className="eyebrow">{isLogin ? 'WELCOME BACK' : 'START MONITORING'}</p>
          <h2>{isLogin ? 'Увійти до акаунта' : 'Створити акаунт'}</h2>
          <p className="form-note">{isLogin ? 'Раді знову вас бачити.' : 'Перші кроки займуть менше хвилини.'}</p>

          <label>Електронна пошта
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          </label>
          <label>Пароль
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Щонайменше 8 символів" minLength={8} required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Зачекайте…' : isLogin ? 'Увійти' : 'Створити акаунт'}
          </button>
          <p className="switch-auth">
            {isLogin ? 'Ще не маєте акаунта?' : 'Вже маєте акаунт?'}{' '}
            <Link href={isLogin ? '/register' : '/login'}>{isLogin ? 'Зареєструватися' : 'Увійти'}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

