## 🔖 Smart Bookmark App
A real-time, secure bookmark manager built with Next.js 14, Supabase, and Tailwind CSS.

## 🚀 Live Demo
URL: https://smart-bookmark-app-nine-silk.vercel.app/

## 🛠 Tech Stack
Framework: Next.js (App Router)

Database & Auth: Supabase (PostgreSQL + Google OAuth)

## Realtime: Supabase Broadcast/Replication

Styling: Tailwind CSS

🧠 Technical Challenges & Solutions
1. Realtime Delete Sync (The "Replica Identity" Issue)
Problem: While "Insert" events were updating the UI instantly, "Delete" events were not reflecting across tabs even though the Realtime channel was active.
Solution: I discovered that the PostgreSQL REPLICA IDENTITY was set to DEFAULT. This meant the deletion payload didn't contain enough information for the client-side filter to identify which row was removed. I resolved this by running an SQL query in the Supabase editor to set ALTER TABLE bookmarks REPLICA IDENTITY FULL;, ensuring the full record is broadcasted on all events.
