import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../Lib/supabaseClient";

export default function SpectatePage() {
  const router = useRouter();
  const { user } = router.query;
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  async function fetchTasks() {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("username", user)
      .single();

    if (data) {
      const { data: tasksData } = await supabase
        .from("personal_tasks")
        .select("*")
        .eq("user_id", data.id);
      setTasks(tasksData || []);
    }
  }

  return (
    <div>
      <h1>Spectate {user}'s ToDo</h1>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title} - {t.status}</li>
        ))}
      </ul>
    </div>
  );
}
