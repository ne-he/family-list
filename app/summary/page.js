"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../Lib/supabaseClient";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

export const dynamic = "force-dynamic";

const actionColors = {
  created: "#c8a96e",
  updated: "#64a0c8",
  checked: "#64b478",
  deleted: "#c87070",
};

export default function SummaryPage() {
  const [logs, setLogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: prof } = await supabase.from("users").select("*").eq("id", user.id).single();
    setProfile(prof);
    const { data } = await supabase
      .from("task_logs").select("*, users(username, role)")
      .order("timestamp", { ascending: false }).limit(100);
    setLogs(data || []);
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  // Group by date
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar user={profile} />
      <main style={{ marginLeft: "220px", flex: 1, padding: "2.5rem 3rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "3px", marginBottom: "6px" }}>ACTIVITY</div>
          <h1 style={{ fontSize: "2rem", color: "var(--text-main)", fontWeight: "normal" }}>Daily Summary</h1>
        </div>

        {logs.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Belum ada aktivitas tercatat ✦</div>
        )}

        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date} style={{ marginBottom: "2rem" }}>
            <div style={{
              fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "2px",
              marginBottom: "0.8rem", paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--border)",
            }}>
              {date.toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {entries.map(log => {
                const color = actionColors[log.action] || "var(--text-muted)";
                return (
                  <div key={log.id} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "10px", padding: "0.8rem 1.2rem",
                    display: "flex", alignItems: "center", gap: "1rem",
                  }}>
                    <div style={{
                      padding: "3px 10px", borderRadius: "20px",
                      background: `${color}18`, color,
                      fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase",
                      flexShrink: 0, minWidth: "70px", textAlign: "center",
                    }}>
                      {log.action}
                    </div>
                    <div style={{ flex: 1, color: "var(--text-main)", fontSize: "0.88rem" }}>
                      Task #{log.task_id?.slice(0, 8)}
                    </div>
                    <div style={{ color: "var(--accent)", fontSize: "0.82rem", textTransform: "capitalize" }}>
                      {log.users?.username || log.users?.role || "—"}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
      <div style={{ color: "var(--accent)", letterSpacing: "4px", fontSize: "0.8rem" }}>LOADING...</div>
    </div>
  );
}
