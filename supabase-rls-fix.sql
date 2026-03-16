-- Tambahkan policy agar semua user yang login bisa baca tabel users
-- (dibutuhkan untuk spectate dan family task assignment)
create policy "Authenticated users can view all profiles"
  on users for select
  using (auth.uid() is not null);

-- Tambahkan policy agar semua user yang login bisa baca personal_tasks orang lain
-- (dibutuhkan untuk spectate)
create policy "Authenticated users can spectate personal tasks"
  on personal_tasks for select
  using (auth.uid() is not null);

-- Tambahkan policy agar semua user yang login bisa insert task_logs
create policy "Authenticated users can insert logs"
  on task_logs for insert
  with check (auth.uid() = user_id);
