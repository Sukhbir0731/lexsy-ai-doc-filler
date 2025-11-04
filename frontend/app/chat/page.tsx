"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

export default function ChatPage() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const p = localStorage.getItem("lexsy.placeholders");
    if (!p) {
      router.push("/upload");
      return;
    }

    let parsed: string[] = [];
    try {
      parsed = JSON.parse(p);
    } catch {
      router.push("/upload");
      return;
    }

    const cleaned = parsed.filter(
      (ph) => typeof ph === "string" && ph.trim().length > 0
    );

    if (cleaned.length === 0) {
      router.push("/upload");
      return;
    }

    setPlaceholders(cleaned);

    const firstLabel = cleaned[0].replaceAll("_", " ");
    setChat([
      {
        role: "ai",
        content: "Thanks for uploading your document! Let's get started.",
      },
      {
        role: "ai",
        content: `What is your ${firstLabel}?`,
      },
    ]);
  }, [router]);

  const currentKey = placeholders[index];

  async function handleSend() {
    if (!input.trim()) return;

    const cleanInput = input.trim();
    const lower = cleanInput.toLowerCase();

    if (lower === "yes" || lower === "y") {
      const userMsg: ChatMessage = { role: "user", content: cleanInput };
      setChat((prev) => [...prev, userMsg]);
      setInput("");
      await generateAndPreview();
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: cleanInput };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);

    const updated = { ...values, [currentKey]: cleanInput };
    setValues(updated);
    localStorage.setItem("lexsy.values", JSON.stringify(updated));

    try {
      const form = new FormData();
      form.append("message", cleanInput);
      form.append("placeholder", currentKey);
      form.append("values", JSON.stringify(updated));
      const res = await api.post("/chat", form);
      const aiResponse = res.data.response;

      let aiMsg: string;
      const nextIdx = index + 1;

      if (nextIdx < placeholders.length) {
        const nextKey = placeholders[nextIdx];
        const nextLabel = nextKey ? nextKey.replaceAll("_", " ") : "next field";
        aiMsg = `${aiResponse} What is your ${nextLabel}?`;
        setIndex(nextIdx);
      } else {
        const summary = Object.entries(updated)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        aiMsg = `${aiResponse} Here’s what I have:\n${summary}\nIs this information correct? (type Yes to confirm)`;
      }

      setChat((prev) => [...prev, { role: "ai", content: aiMsg }]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { role: "ai", content: "[AI unavailable — mock mode]" },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!chat.length) return;
    const lastMsg = chat[chat.length - 1];
    if (lastMsg.role === "user" && /yes/i.test(lastMsg.content.trim())) {
      generateAndPreview();
    }
  }, [chat]);

  async function generateAndPreview() {
    setLoading(true);
    try {
      const placeholders = JSON.parse(
        localStorage.getItem("lexsy.placeholders") || "[]"
      );
      const values = JSON.parse(localStorage.getItem("lexsy.values") || "{}");
      await api.post("/generate", { placeholders, values });
      router.push("/preview");
    } catch (err) {
      alert("Failed to generate document.");
    } finally {
      setLoading(false);
    }
  }

  if (!placeholders.length)
    return (
      <p className="text-center text-gray-600 mt-12">
        No placeholders loaded. Please upload a document first.
      </p>
    );

  return (
    <div className="max-w-lg mx-auto mt-12 flex flex-col h-[75vh]">
      <h2 className="text-xl font-semibold mb-3 text-center">
        Lexsy Assistant
      </h2>

      <div className="flex-1 border rounded p-3 bg-gray-50 overflow-y-auto">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`my-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <Loader />}
      </div>

      <div className="flex mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-black text-white border border-gray-700 rounded-l p-2 placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
