import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api, { apiErrorMessage } from "../../lib/api.js";
import { formatDate } from "../../lib/formatters.js";
import { maatregelStatusLabel } from "../../lib/projecten.js";

function PlanBadge({ plan }) {
  const p = (plan || "gratis").toLowerCase();
  const cls =
    p === "pro"
      ? "bg-purple-100 text-purple-800"
      : p === "starter"
        ? "bg-amber-100 text-amber-900"
        : "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {p}
    </span>
  );
}

export default function KlantDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [tree, setTree] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteBody, setNoteBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openProjects, setOpenProjects] = useState(() => new Set());

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      try {
        const [d, t, n] = await Promise.all([
          api.get(`/admin/klanten/${id}`),
          api.get(`/admin/klanten/${id}/projecten`),
          api.get(`/admin/klanten/${id}/notities`),
        ]);
        if (!cancel) {
          setDetail(d.data);
          setTree(t.data);
          setNotes(n.data);
          setError(null);
        }
      } catch (e) {
        if (!cancel) setError(apiErrorMessage(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [id]);

  async function addNote(e) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    try {
      const res = await api.post(`/admin/klanten/${id}/notities`, {
        body: noteBody.trim(),
      });
      setNotes((prev) => [res.data, ...prev]);
      setNoteBody("");
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  function toggleProject(pid) {
    setOpenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="container-app py-12 text-center text-gray-500">
        Laden…
      </div>
    );
  }
  if (error || !detail || !tree) {
    return (
      <div className="container-app py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Klant niet gevonden"}
        </div>
        <Link to="/admin/klanten" className="mt-4 inline-block text-brand-green">
          ← Terug
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="mb-6">
        <Link
          to="/admin/klanten"
          className="text-sm font-semibold text-brand-green hover:underline"
        >
          ← Klanten
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {detail.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{detail.primary_contact_email}</p>
            {detail.primary_phone && (
              <p className="text-sm text-gray-600">{detail.primary_phone}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PlanBadge plan={detail.subscription_plan} />
              <span className="text-xs text-gray-500">
                Lid sinds {formatDate(detail.created_at)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.primary_contact_email && (
              <a
                href={`mailto:${detail.primary_contact_email}`}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                Mail klant
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Projecten & dossiers
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm leading-relaxed text-gray-800">
          <div>
            📁 {tree.organisation_name}
          </div>
          {tree.projecten.length === 0 ? (
            <p className="mt-2 text-gray-500">Nog geen projecten.</p>
          ) : (
            tree.projecten.map((proj) => (
              <div key={proj.id} className="ml-4 mt-2 border-l border-gray-200 pl-3">
                <button
                  type="button"
                  onClick={() => toggleProject(proj.id)}
                  className="text-left font-semibold hover:text-brand-green"
                >
                  {openProjects.has(proj.id) ? "▼" : "▶"} 📁 Project:{" "}
                  {proj.adres_label} — {proj.bouwjaar}
                </button>
                {openProjects.has(proj.id) && (
                  <div className="ml-4 mt-1 space-y-2">
                    {proj.maatregelen.length === 0 ? (
                      <div className="text-gray-500">Geen dossiers.</div>
                    ) : (
                      proj.maatregelen.map((m) => (
                        <div key={m.id} className="border-l border-dashed border-gray-300 pl-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>
                              📋 {m.regeling_code || "—"} —{" "}
                              <span className="rounded bg-gray-100 px-1.5 text-xs">
                                {maatregelStatusLabel(m.status)}
                              </span>
                              {m.deadline_indienen && (
                                <span className="text-xs text-gray-500">
                                  {" "}
                                  · deadline {formatDate(m.deadline_indienen)}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Documenten: {m.verplicht_docs_geupload}/
                            {m.verplicht_docs_totaal} aanwezig
                          </div>
                          <Link
                            to={`/admin/projecten/${proj.id}/maatregelen/${m.id}`}
                            className="text-xs font-semibold text-brand-green hover:underline"
                          >
                            Bekijk dossier →
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Interne notities
        </h2>
        <form onSubmit={addNote} className="mb-4 flex flex-wrap gap-2">
          <textarea
            className="input min-h-[80px] flex-1"
            placeholder="Notitie toevoegen (alleen zichtbaar voor admins)…"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
          />
          <button type="submit" className="btn-primary self-end !py-2 !px-4">
            Notitie toevoegen
          </button>
        </form>
        <ul className="space-y-3">
          {notes.length === 0 ? (
            <li className="text-sm text-gray-500">Nog geen notities.</li>
          ) : (
            notes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-gray-100 bg-white p-3 text-sm shadow-sm"
              >
                <div className="text-xs text-gray-500">
                  {n.author_email} · {formatDate(n.created_at)}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-gray-800">
                  {n.body}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
