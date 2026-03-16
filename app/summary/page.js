"use client"
import { useEffect, useState } from "react";
import { supabase } from "../../Lib/supabaseClient";
export const dynamic = "force-dynamic";

export default function SummaryPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data } = await supabase.from("task_logs").select("*").order("timestamp", { ascending: false });
    setLogs(data || []);
  }

  return (
    <div>
      <h1>Daily Summary</h1>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>User</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.task_id}</td>
              <td>{log.user_id}</td>
              <td>{log.action}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
