"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push("/");
        return;
      }

      setUser(user);
      await fetchBookmarks(user.id);
      setIsLoading(false);

      // Realtime Subscription
      const channel = supabase
        .channel("bookmarks-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchBookmarks(user.id)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUser();
  }, [router]);

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const validateUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !user) return;

    if (!validateUrl(url)) {
      alert("Please enter a valid URL (including http:// or https://)");
      return;
    }

    setIsAdding(true);
    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
    }
    setIsAdding(false);
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800">🔖 SmartBook</h1>
            {user && <p className="text-xs text-gray-500">{user.email}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Add Bookmark Form */}
        <form onSubmit={addBookmark} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Add New Bookmark</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title (e.g. GitHub)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
            <input
              type="text"
              placeholder="URL (https://...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isAdding ? "Saving..." : "Save Bookmark"}
            </button>
          </div>
        </form>

        {/* Bookmark List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Your Collection</h2>
          
          {isLoading ? (
            /* Skeleton Loading State */
            [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-xl h-20 border border-gray-100"></div>
            ))
          ) : bookmarks.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No bookmarks found. Start by adding one above!</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-800 truncate">{bookmark.title}</p>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline truncate block"
                  >
                    {bookmark.url}
                  </a>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Bookmark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}