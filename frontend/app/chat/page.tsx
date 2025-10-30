"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function ChatPage() {
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("placeholders");
    if (stored) setPlaceholders(JSON.parse(stored));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placeholders[index]) return;

    setLoading(true);
    try {
      // Optional AI guidance call
      await api.post("/chat", {
        message: answers[placeholders[index]],
        placeholder: placeholders[index],
      });
      // Move to next placeholder
      if (index + 1 < placeholders.length) {
        setIndex(index + 1);
      } else {
        // Finished
        localStorage.setItem("filledValues", JSON.stringify(answers));
        router.push("/preview");
      }
    } catch (err) {
      console.error(err);
      alert("Chat error");
    } finally {
      setLoading(false);
    }
  }

  if (!placeholders.length)
    return (
      <p className="text-center text-gray-600 mt-12">No placeholders loaded.</p>
    );

  const current = placeholders[index];

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Fill placeholder {index + 1} of {placeholders.length}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="font-medium">{current}</label>
        <input
          type="text"
          value={answers[current] || ""}
          onChange={(e) =>
            setAnswers({ ...answers, [current]: e.target.value })
          }
          className="border rounded p-2"
          required
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Next"}
        </button>
      </form>
      {loading && <Loader />}
    </div>
  );
}
