"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Loader from "@/components/Loader";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Please select a .docx file first.");

    setError("");
    setLoading(true);

    try {
      localStorage.removeItem("lexsy.placeholders");
      localStorage.removeItem("lexsy.values");
      localStorage.removeItem("lexsy.fileId");

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const placeholders = res.data.placeholders;
      if (!placeholders?.length) {
        throw new Error("No placeholders found in document.");
      }

      localStorage.setItem("lexsy.fileId", res.data.file_id);

      localStorage.setItem("lexsy.placeholders", JSON.stringify(placeholders));
      localStorage.setItem("lexsy.values", JSON.stringify({}));

      router.push("/chat");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Upload Word Template
      </h2>

      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border rounded p-2"
        />

        <button
          disabled={!file || loading}
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload and Parse"}
        </button>
      </form>

      {loading && <Loader />}
      {error && (
        <p className="text-red-500 mt-2 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
