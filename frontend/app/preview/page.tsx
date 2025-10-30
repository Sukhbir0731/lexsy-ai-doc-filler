"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/components/Loader";

export default function PreviewPage() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const placeholders = localStorage.getItem("placeholders");
    const filledValues = localStorage.getItem("filledValues");

    if (placeholders && filledValues) {
      generateDoc(JSON.parse(placeholders), JSON.parse(filledValues));
    }
  }, []);

  async function generateDoc(
    placeholders: string[],
    filled: Record<string, string>
  ) {
    setLoading(true);
    try {
      const res = await api.post("/generate", { placeholders, values: filled });
      setFileId(res.data.file_id);
    } catch (err) {
      console.error(err);
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center mt-16 gap-6">
      <h2 className="text-2xl font-semibold">Preview & Download</h2>
      {loading && <Loader />}
      {fileId && (
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/download/${fileId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download Filled Document
        </a>
      )}
    </div>
  );
}
