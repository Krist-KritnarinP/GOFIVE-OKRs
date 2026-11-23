import { useEffect, useState } from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';
import { fetchHealthStatus } from '../services/apiClient.js';

export function HomePage({ t }) {
  const [apiState, setApiState] = useState({ checked: false, online: false, storageMode: null });

  useEffect(() => {
    let active = true;
    fetchHealthStatus()
      .then((res) => {
        if (active) {
          setApiState({
            checked: true,
            online: Boolean(res?.ok),
            storageMode: res?.data?.storageMode || null,
          });
        }
      })
      .catch(() => {
        if (active) {
          setApiState({ checked: true, online: false, storageMode: null });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const statusStyles = apiState.online
    ? {
        backgroundColor: 'var(--status-high-bg)',
        color: 'var(--status-high-text)',
        borderColor: 'var(--status-high-border)',
      }
    : {
        backgroundColor: 'var(--status-warn-bg)',
        color: 'var(--status-warn-text)',
        borderColor: 'var(--status-warn-border)',
      };

  return (
    <div className="w-full space-y-6">
      <section className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span
              className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-md border"
              style={{
                backgroundColor: 'var(--status-track-bg)',
                color: 'var(--status-track-text)',
                borderColor: 'var(--status-track-border)',
              }}
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              {t.gateBadge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink-primary)]">
              {t.heroTitle}
            </h1>
            <p className="text-base text-[var(--ink-secondary)]">{t.heroSubtitle}</p>
          </div>

          <div
            className="rounded-lg border p-4 min-w-[260px]"
            style={statusStyles}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span>{t.apiStatusLabel}</span>
            </div>
            <p className="mt-1.5 text-base font-bold">
              {apiState.online ? t.apiOnline : t.apiOffline}
            </p>
            {apiState.storageMode && (
              <p className="mt-1 text-sm tabular-nums">
                Mode: <code>{apiState.storageMode}</code>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="w-full space-y-4">
        <h2 className="text-xl font-bold text-[var(--ink-primary)]">{t.pillarsTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {t.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-2"
            >
              <h3 className="text-base font-semibold text-[var(--ink-primary)]">{pillar.title}</h3>
              <p className="text-sm sm:text-base text-[var(--ink-secondary)]">{pillar.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
