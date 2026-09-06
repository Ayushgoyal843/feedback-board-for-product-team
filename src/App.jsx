import { useState, useEffect } from "react";

const STORAGE_KEY = "signal-board-items";

const CATEGORIES = ["Bug", "Feature", "Improvement"];
const STATUSES = ["New", "Planned", "In Progress", "Shipped"];

const CATEGORY_COLORS = {
  Bug: { bg: "#F3E4DC", text: "#8A3B1F" },
  Feature: { bg: "#DCE7DF", text: "#33513E" },
  Improvement: { bg: "#E6E1D6", text: "#5B5342" },
};

const SEED = [
  {
    id: 1,
    title: "Dark mode for the calendar view",
    description: "Calendar is the only screen that stays bright white even when dark mode is on everywhere else.",
    category: "Feature",
    status: "Planned",
    votes: 24,
  },
  {
    id: 2,
    title: "Export freezes on boards over 200 cards",
    description: "CSV export hangs the tab for large boards. Have to force-quit and reopen.",
    category: "Bug",
    status: "New",
    votes: 31,
  },
  {
    id: 3,
    title: "Mention notifications arrive twice",
    description: "Every @mention sends two identical push notifications, a few seconds apart.",
    category: "Bug",
    status: "In Progress",
    votes: 18,
  },
  {
    id: 4,
    title: "Pin a column to the top of the board",
    description: "Would help to keep 'Blocked' visible without scrolling past four other columns first.",
    category: "Improvement",
    status: "New",
    votes: 12,
  },
  {
    id: 5,
    title: "Keyboard shortcut to archive a card",
    description: "Reaching for the mouse to archive one card at a time slows down end-of-sprint cleanup.",
    category: "Feature",
    status: "Shipped",
    votes: 9,
  },
  {
    id: 6,
    title: "Board loads slowly on first open",
    description: "Takes three to four seconds before any cards render, even on a fast connection.",
    category: "Bug",
    status: "Planned",
    votes: 15,
  },
];

function CategoryTag({ category }) {
  const colors = CATEGORY_COLORS[category];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: colors.bg, color: colors.text }}
    >
      {category}
    </span>
  );
}

function FeedbackCard({ item, onUpvote, onStatusChange }) {
  return (
    <div
      className="rounded-lg p-3 mb-3"
      style={{ background: "#FFFFFF", border: "1px solid #E1DDD0" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug" style={{ color: "#26241D" }}>
          {item.title}
        </h3>
        <button
          onClick={() => onUpvote(item.id)}
          className="flex flex-col items-center justify-center shrink-0 rounded px-2 py-1"
          style={{ border: "1px solid #DAD5C7", color: "#4C6B57" }}
        >
          <span className="text-xs leading-none">&#9650;</span>
          <span className="text-xs font-medium leading-none mt-1">{item.votes}</span>
        </button>
      </div>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: "#71695A" }}>
        {item.description}
      </p>
      <div className="flex items-center justify-between mt-3">
        <CategoryTag category={item.category} />
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value)}
          className="text-xs rounded px-1.5 py-1"
          style={{ border: "1px solid #DAD5C7", color: "#5B5342", background: "#FBFAF6" }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function NewFeedbackForm({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim(), category });
    onClose();
  };

  return (
    <div className="rounded-lg p-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E1DDD0" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What should change?"
        className="w-full text-sm rounded px-2 py-2 mb-2"
        style={{ border: "1px solid #DAD5C7" }}
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a little context (optional)"
        rows={2}
        className="w-full text-sm rounded px-2 py-2 mb-2"
        style={{ border: "1px solid #DAD5C7" }}
      />
      <div className="flex items-center justify-between">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-xs rounded px-2 py-1.5"
          style={{ border: "1px solid #DAD5C7" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded"
            style={{ color: "#71695A" }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="text-xs px-3 py-1.5 rounded font-medium"
            style={{ background: "#4C6B57", color: "#F6F4EE" }}
          >
            Add feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : SEED;
  });
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [nextId, setNextId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : SEED;
    return parsed.length ? Math.max(...parsed.map((i) => i.id)) + 1 : 1;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const upvote = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i)));

  const changeStatus = (id, status) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  const addItem = ({ title, description, category }) => {
    setItems((prev) => [
      ...prev,
      { id: nextId, title, description, category, status: "New", votes: 0 },
    ]);
    setNextId((n) => n + 1);
  };

  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="min-h-screen w-full" style={{ background: "#F6F4EE" }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl" style={{ fontFamily: "Georgia, serif", color: "#26241D" }}>
              Signal
            </h1>
            <p className="text-sm mt-1" style={{ color: "#71695A" }}>
              Feedback board for the product team
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm px-4 py-2 rounded font-medium"
            style={{ background: "#4C6B57", color: "#F6F4EE" }}
          >
            + New feedback
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={
                filter === c
                  ? { background: "#26241D", color: "#F6F4EE" }
                  : { background: "#EDEADF", color: "#5B5342" }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {showForm && <NewFeedbackForm onAdd={addItem} onClose={() => setShowForm(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STATUSES.map((status) => {
            const columnItems = visible
              .filter((i) => i.status === status)
              .sort((a, b) => b.votes - a.votes);
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8A8371" }}>
                    {status}
                  </h2>
                  <span className="text-xs" style={{ color: "#8A8371" }}>
                    {columnItems.length}
                  </span>
                </div>
                {columnItems.length === 0 && (
                  <p className="text-xs italic" style={{ color: "#A39C8B" }}>
                    Nothing here yet
                  </p>
                )}
                {columnItems.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    item={item}
                    onUpvote={upvote}
                    onStatusChange={changeStatus}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
