import React, { useEffect, useMemo, useState } from "react";

export function todofunc() {
  return (
    <div>
      <DynamicPage />
    </div>
  );
}

// Single-file, single-page dynamic JSX component
// - Search, filter, sort
// - Create, edit, delete in-memory with localStorage persistence
// - Lightweight stats and responsive layout
// - Tailwind-based styling only (no external UI libs)

const seedData = [
  { id: 1, name: "Alpha", category: "Todo", priority: "High", tags: ["core", "v1"], done: false, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
  { id: 2, name: "Beta", category: "Bug", priority: "Medium", tags: ["ui"], done: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10 },
  { id: 3, name: "Gamma", category: "Feature", priority: "Low", tags: ["api", "v2"], done: false, createdAt: Date.now() - 1000 * 60 * 60 * 6 },
  { id: 4, name: "Delta", category: "Feature", priority: "High", tags: ["perf"], done: false, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1 },
  { id: 5, name: "Epsilon", category: "Bug", priority: "High", tags: ["backend"], done: true, createdAt: Date.now() - 1000 * 60 * 60 * 48 },
];

const categories = ["All", "Todo", "Bug", "Feature"];
const priorities = ["Low", "Medium", "High"];

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl p-4 shadow-sm bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
      {children}
    </span>
  );
}

function ItemRow({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(item);

  useEffect(() => setForm(item), [item]);

  const save = () => {
    onUpdate({ ...form, tags: form.tags.filter(Boolean) });
    setEditing(false);
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60">
      <div className="col-span-4">
        {editing ? (
          <input
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        ) : (
          <div className="font-medium flex items-center gap-2">
            <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
            <span className={item.done ? "line-through text-zinc-500" : ""}>{item.name}</span>
          </div>
        )}
      </div>
      <div className="col-span-2">
        {editing ? (
          <select
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.filter((c) => c !== "All").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        ) : (
          <Pill>{item.category}</Pill>
        )}
      </div>
      <div className="col-span-2">
        {editing ? (
          <select
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        ) : (
          <Pill>{item.priority}</Pill>
        )}
      </div>
      <div className="col-span-3 flex flex-wrap gap-2">
        {editing ? (
          <input
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            placeholder="comma,separated,tags"
            value={form.tags.join(",")}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()) })}
          />
        ) : (
          item.tags.map((t, i) => <Pill key={i}>{t}</Pill>)
        )}
      </div>
      <div className="col-span-1 flex justify-end gap-2">
        {editing ? (
          <>
            <button className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700" onClick={save}>
              Save
            </button>
            <button className="px-2 py-1 rounded-lg border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="px-2 py-1 rounded-lg border border-red-300 text-red-600" onClick={() => onDelete(item.id)}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DynamicPage() {
  const [items, setItems] = useLocalState("dynamic-items", seedData);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("recent");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [dark, setDark] = useLocalState("dynamic-dark", false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Todo", priority: "Medium", tags: "", done: false });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(dark));
  }, [dark]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((it) =>
      [it.name, it.category, it.priority, ...(it.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
    if (cat !== "All") list = list.filter((it) => it.category === cat);
    if (onlyOpen) list = list.filter((it) => !it.done);

    const sorters = {
      recent: (a, b) => b.createdAt - a.createdAt,
      priority: (a, b) => priorities.indexOf(b.priority) - priorities.indexOf(a.priority),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    list.sort(sorters[sort]);
    return list;
  }, [items, query, cat, sort, onlyOpen]);

  const stats = useMemo(() => {
    const total = items.length;
    const open = items.filter((i) => !i.done).length;
    const done = total - open;
    const byCat = Object.fromEntries(categories.filter((c) => c !== "All").map((c) => [c, items.filter((i) => i.category === c).length]));
    return { total, open, done, byCat };
  }, [items]);

  const addItem = () => {
    const t = (form.tags || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = {
      id: Math.max(0, ...items.map((i) => i.id)) + 1,
      name: form.name || `Untitled ${items.length + 1}`,
      category: form.category,
      priority: form.priority,
      tags: t,
      done: form.done,
      createdAt: Date.now(),
    };
    setItems([next, ...items]);
    setForm({ name: "", category: "Todo", priority: "Medium", tags: "", done: false });
    setShowCreate(false);
  };

  const updateItem = (patch) => {
    setItems((prev) => prev.map((i) => (i.id === patch.id ? { ...i, ...patch } : i)));
  };

  const deleteItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const toggleItem = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dynamic Single-Page (JSX)</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              className="px-3 py-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-900"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-900"
            >
              + Add Item
            </button>
          </div>
        </header>

        {/* Controls */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            placeholder="Search name, tag, priority..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Sort: Recent</option>
            <option value="priority">Sort: Priority</option>
            <option value="name">Sort: Name</option>
          </select>
          <label className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
            Only Open
          </label>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Open" value={stats.open} />
          <Stat label="Done" value={stats.done} />
          <Stat label="Features" value={stats.byCat.Feature || 0} />
        </section>

        {/* List */}
        <section className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-zinc-500 text-center py-8">No items match your filters.</div>
          ) : (
            filtered.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
                onUpdate={updateItem}
              />
            ))
          )}
        </section>

        {/* Create Drawer */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-lg rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-4">Create Item</h2>
              <div className="grid grid-cols-1 gap-3">
                <input
                  className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {priorities.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <input
                  className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  placeholder="Tags (comma separated)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.done} onChange={(e) => setForm({ ...form, done: e.target.checked })} />
                  Mark as done
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800" onClick={addItem}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-xs text-zinc-500 dark:text-zinc-400 pt-6 pb-2">
          <div>State persists to localStorage. Drop this file into any React app to use.</div>
        </footer>
      </div>
    </div>
  );
}
export { DynamicPage };

