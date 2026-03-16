import { useEffect, useState } from "react";
import { supabase } from "../Lib/supabaseClient";

export default function FamilyTasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data } = await supabase.from("family_tasks").select("*");
    setTasks(data || []);
  }

  async function addTask(e) {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;
    await supabase.from("family_tasks").insert({
      title,
      created_by: user.id,
    });
    setTitle("");
    fetchTasks();
  }

  return (
    <div>
      <h1>Family ToDo</h1>
      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New family task..."
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
