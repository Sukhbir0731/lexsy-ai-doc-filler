"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Save placeholders to localStorage for next page
      localStorage.setItem(
        "placeholders",
        JSON.stringify(res.data.placeholders)
      );
      router.push("/chat");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Upload .docx File
      </h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border rounded p-2"
        />
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {loading && <Loader />}
    </div>
  );
}
