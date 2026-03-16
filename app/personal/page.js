"use client"
import { useEffect, useState } from "react";
import { supabase } from "../../Lib/supabaseClient";
export const dynamic = "force-dynamic";

export default function PersonalTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data } = await supabase.from("personal_tasks").select("*");
    setTasks(data || []);
  }

  async function addTask(e) {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;
    await supabase.from("personal_tasks").insert({
      user_id: user.id,
      title,
    });
    setTitle("");
    fetchTasks();
  }

  return (
    <div>
      <h1>Personal ToDo</h1>
      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title} - {t.status}</li>
        ))}
      </ul>
    </div>
  );
}
