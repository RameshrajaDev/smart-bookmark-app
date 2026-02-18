"use client";

import { supabase } from "@/lib/supabase";

export default function Home() {

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://smart-bookmark-app-nine-silk.vercel.app/dashboard",
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">Smart Bookmark App</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
