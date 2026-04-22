import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { apiErrorMessage } from "../lib/api.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../lib/projecten.js";
import { formatDate } from "../lib/formatters.js";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ items: [], unread_count: 0 });
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const d = await listNotifications();
      setData(d);
    } catch {
      setData({ items: [], unread_count: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function onPick(n) {
    try {
      if (!n.read_at) await markNotificationRead(n.id);
    } catch (e) {
      console.warn(apiErrorMessage(e));
    }
    setOpen(false);
    window.location.assign(`/projecten/${n.project_id}`);
  }

  async function onReadAll(e) {
    e.stopPropagation();
    try {
      await markAllNotificationsRead();
      await load();
    } catch (err) {
      console.warn(apiErrorMessage(err));
    }
  }

  const unread = data.unread_count || 0;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="relative rounded-lg border border-white/40 p-2 text-white transition hover:bg-white/10"
        aria-label="Notificaties"
      >
        <span className="text-lg" aria-hidden>
          🔔
        </span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-amber-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white py-2 text-gray-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 pb-2">
            <span className="text-sm font-bold">Meldingen</span>
            {data.items.some((i) => !i.read_at) && (
              <button
                type="button"
                onClick={onReadAll}
                className="text-xs font-semibold text-brand-green hover:underline"
              >
                Alles gelezen
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-3 py-4 text-center text-xs text-gray-500">
                Laden…
              </div>
            )}
            {!loading && data.items.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                Geen meldingen
              </div>
            )}
            {!loading &&
              data.items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onPick(n)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-gray-50 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-gray-50 ${
                    !n.read_at ? "bg-amber-50/50" : ""
                  }`}
                >
                  <span className="font-semibold text-gray-900">{n.title}</span>
                  {n.body && (
                    <span className="line-clamp-2 text-xs text-gray-600">{n.body}</span>
                  )}
                  <span className="text-[11px] text-gray-400">
                    {formatDate(n.created_at)}
                  </span>
                </button>
              ))}
          </div>
          <div className="border-t border-gray-100 px-3 pt-2">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-brand-green hover:underline"
            >
              Naar dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
