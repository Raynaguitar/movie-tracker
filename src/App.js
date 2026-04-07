import { useState } from "react";

const KEY = "f190bf4f";
const PROXY = "https://corsproxy.io/?";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [watched, setWatched] = useState({});
  const [want, setWant] = useState({});
  const [tab, setTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const url = `https://www.omdbapi.com/?apikey=${KEY}&s=${encodeURIComponent(query)}&type=movie`;
      const res = await fetch(PROXY + encodeURIComponent(url));
      const data = await res.json();
      if (data.Response === "False") {
        setError(data.Error || "No results found");
        setResults([]);
      } else {
        setResults(data.Search || []);
        setTab("search");
      }
    } catch (e) {
      setError("Network error — please try again");
    }
    setLoading(false);
  }

  function toggleWatched(movie) {
    setWatched((prev) => {
      const next = { ...prev };
      if (next[movie.imdbID]) delete next[movie.imdbID];
      else next[movie.imdbID] = movie;
      return next;
    });
    setWant((prev) => {
      const next = { ...prev };
      delete next[movie.imdbID];
      return next;
    });
  }

  function toggleWant(movie) {
    setWant((prev) => {
      const next = { ...prev };
      if (next[movie.imdbID]) delete next[movie.imdbID];
      else next[movie.imdbID] = movie;
      return next;
    });
    setWatched((prev) => {
      const next = { ...prev };
      delete next[movie.imdbID];
      return next;
    });
  }

  const allMovies = () => {
    const map = {};
    [...results, ...Object.values(watched), ...Object.values(want)].forEach(
      (m) => (map[m.imdbID] = m)
    );
    return map;
  };

  function MovieCard({ movie }) {
    const isW = !!watched[movie.imdbID];
    const isS = !!want[movie.imdbID];
    return (
      <div style={styles.card}>
        <div style={styles.poster}>
          {movie.Poster && movie.Poster !== "N/A" ? (
            <img
              src={movie.Poster}
              alt={movie.Title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 36 }}>🎬</span>
          )}
        </div>
        <div style={styles.info}>
          <div style={styles.title} title={movie.Title}>{movie.Title}</div>
          <div style={styles.year}>{movie.Year}</div>
          <div style={styles.actions}>
            <button
              onClick={() => toggleWatched(allMovies()[movie.imdbID] || movie)}
              style={{ ...styles.btn, ...(isW ? styles.btnW : {}) }}
            >
              {isW ? "✓ Watched" : "Watched"}
            </button>
            <button
              onClick={() => toggleWant(allMovies()[movie.imdbID] || movie)}
              style={{ ...styles.btn, ...(isS ? styles.btnS : {}) }}
            >
              {isS ? "★ Saved" : "+ Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const panels = {
    search: results,
    watched: Object.values(watched),
    want: Object.values(want),
  };

  const emptyMessages = {
    search: "Search for any movie above",
    watched: "No watched movies yet",
    want: "Nothing saved yet",
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.h1}>🎬 Movie Tracker</h1>
      <p style={styles.subtitle}>Search any movie and build your watchlist</p>

      <div style={styles.searchRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search movies... (e.g. Inception)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={styles.searchBtn} onClick={handleSearch}>
          Search
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tabs}>
        {["search", "watched", "want"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t === "search" ? "Results" : t === "watched" ? "Watched" : "Want to Watch"}
            <span style={styles.badge}>{panels[t].length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.empty}>Searching...</div>
      ) : panels[tab].length === 0 ? (
        <div style={styles.empty}>{emptyMessages[tab]}</div>
      ) : (
        <div style={styles.grid}>
          {panels[tab].map((m) => (
            <MovieCard key={m.imdbID} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  app: { maxWidth: 700, margin: "0 auto", padding: "2rem 1rem", fontFamily: "Georgia, serif" },
  h1: { fontSize: 28, fontWeight: 500, marginBottom: 4, color: "#1e3a5f" },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  searchRow: { display: "flex", gap: 8, marginBottom: 16 },
  input: { flex: 1, fontSize: 14, padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", outline: "none" },
  searchBtn: { fontSize: 13, padding: "8px 18px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  error: { fontSize: 13, color: "#c00", background: "#fee", padding: "8px 12px", borderRadius: 8, marginBottom: 12 },
  tabs: { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 },
  tab: { fontSize: 13, padding: "6px 14px", border: "none", background: "none", color: "#64748b", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: -1 },
  tabActive: { color: "#1e3a5f", borderBottomColor: "#1e3a5f", fontWeight: 500 },
  badge: { display: "inline-block", fontSize: 11, background: "#f1f5f9", borderRadius: 999, padding: "1px 7px", marginLeft: 5, color: "#64748b" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" },
  poster: { width: "100%", aspectRatio: "2/3", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  info: { padding: 10 },
  title: { fontSize: 13, fontWeight: 500, color: "#1e293b", lineHeight: 1.3, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  year: { fontSize: 11, color: "#94a3b8", marginBottom: 8 },
  actions: { display: "flex", gap: 4 },
  btn: { fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", cursor: "pointer" },
  btnW: { background: "#EAF3DE", color: "#3B6D11", borderColor: "#C0DD97" },
  btnS: { background: "#E6F1FB", color: "#185FA5", borderColor: "#B5D4F4" },
  empty: { textAlign: "center", padding: "3rem 1rem", color: "#94a3b8", fontSize: 14 },
};