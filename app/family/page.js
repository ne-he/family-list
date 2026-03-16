"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../Lib/supabaseClient";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

export const dynamic = "force-dynamic";

const TEMPLATES = [
  "Cuci baju","Setrika","Pel lantai","Masak nasi",
  "Cuci piring","Bersih kamar mandi","Sapu halaman","Belanja bulanan",
];
const statusColors = {
  pending: { bg: "rgba(200,169,110,0.1)", color: "#c8a96e" },
  in_progress: { bg: "rgba(100,160,200,0.1)", color: "#64a0c8" },
  done: { bg: "rgba(100,180,120,0.1)", color: "#64b478" },
};

export default function FamilyTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: prof } = await supabase.from("users").select("*").eq("id", user.id).single();
    setProfile(prof);
    const { data: allUsers } = await supabase.from("users").select("id, username, role");
    setUsers(allUsers || []);
    await fetchTasks();
    setLoading(false);
  }

  async function fetchTasks() {
    const { data } = await supabase.from("family_tasks").select("*").order("created_at", { ascending: false });
    setTasks(data || []);
  }

  async function addTask(e, templateTitle) {
    if (e) e.preventDefault();
    const t = templateTitle || title.trim();
    if (!t || !profile) return;
    await supabase.from("family_tasks").insert({ title: t, created_by: profile.id });
    setTitle("");
    fetchTasks();
  }

  async function updateAssigned(id, userId) {
    await supabase.from("family_tasks").update({ assigned_to: userId || null }).eq("id", id);
    fetchTasks();
  }

  async function updateStatus(id, status) {
    await supabase.from("family_tasks").update({ status }).eq("id", id);
    fetchTasks();
  }

  async function deleteTask(id) {
    await supabase.from("family_tasks").delete().eq("id", id);
    fetchTasks();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <div style={{ color: "var(--accent)", letterSpacing: "4px", fontSize: "0.8rem" }}>LOADING...</div>
      </div>
    );
  }

  const isEditor = profile?.role === "papa" || profile?.role === "mama";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar user={profile} />
      <main style={{ marginLeft: "220px", flex: 1, padding: "2.5rem 3rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "3px", marginBottom: "6px" }}>FAMILY</div>
          <h1 style={{ fontSize: "2rem", color: "var(--text-main)", fontWeight: "normal" }}>Family Tasks</h1>
          {!isEditor && (
            <div style={{ marginTop: "0.8rem", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              Hanya Papa dan Mama yang bisa mengelola tugas keluarga.
            </div>
          )}
        </div>

        {isEditor && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "2px", marginBottom: "0.8rem" }}>TEMPLATE TUGAS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {TEMPLATES.map(t => (
                <button key={t} onClick={() => addTask(null, t)} style={{
                  padding: "6px 14px", background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "20px", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer",
                }}>+ {t}</button>
              ))}
            </div>
            <form onSubmit={addTask} style={{ display: "flex", gap: "0.8rem", maxWidth: "600px" }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tambah tugas lainnya..."
                style={{ flex: 1, padding: "0.8rem 1.2rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-main)", fontSize: "0.9rem", outline: "none" }} />
              <button type="submit" style={{ padding: "0.8rem 1.5rem", background: "var(--accent)", border: "none", borderRadius: "10px", color: "#1a1612", fontWeight: "bold", cursor: "pointer" }}>+ ADD</button>
            </form>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", maxWidth: "800px" }}>
          {tasks.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "2rem 0" }}>Belum ada tugas keluarga ✦</div>
          )}
          {tasks.map(t => {
            const s = statusColors[t.status] || statusColors.pending;
            const assignedUser = users.find(u => u.id === t.assigned_to);
            return (
              <div key={t.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, color: "var(--text-main)", fontSize: "0.95rem" }}>{t.title}</div>
                <select value={t.assigned_to || ""} onChange={e => updateAssigned(t.id, e.target.value)} disabled={!isEditor}
                  style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: "20px", color: assignedUser ? "var(--accent)" : "var(--text-muted)", padding: "4px 10px", fontSize: "0.75rem", cursor: isEditor ? "pointer" : "default", outline: "none" }}>
                  <option value="">— siapa? —</option>
                  {users.map(u => (<option key={u.id} value={u.id}>{u.username || u.role}</option>))}
                </select>
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} disabled={!isEditor}
                  style={{ background: s.bg, border: `1px solid ${s.color}40`, borderRadius: "20px", color: s.color, padding: "4px 10px", fontSize: "0.75rem", cursor: isEditor ? "pointer" : "default", outline: "none" }}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {isEditor && (
                  <button onClick={() => deleteTask(t.id)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>x</button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
