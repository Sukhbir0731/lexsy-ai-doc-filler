"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import PlaceholderPreview from "@/components/PlaceholderPreview";

export default function PreviewPage() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const placeholdersRaw = localStorage.getItem("lexsy.placeholders");
    const valuesRaw = localStorage.getItem("lexsy.values");

    if (!placeholdersRaw || !valuesRaw) {
      setError("Missing data. Please start from upload step.");
      return;
    }

    const placeholders: string[] = JSON.parse(placeholdersRaw);
    const parsedValues: Record<string, string> = JSON.parse(valuesRaw);
    setValues(parsedValues);

    generateDoc(placeholders, parsedValues);
  }, []);

  async function generateDoc(
    placeholders: string[],
    filled: Record<string, string>
  ) {
    setLoading(true);
    setError(null);
    try {
      const fileId = localStorage.getItem("lexsy.fileId");
      const res = await api.post("/generate", {
        file_id: fileId,
        placeholders,
        values: filled,
      });
      setFileId(res.data.file_id);
      localStorage.setItem("lexsy.fileId", res.data.file_id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  if (error)
    return (
      <div className="text-center mt-10 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => (window.location.href = "/upload")}
          className="mt-4 text-blue-600 underline"
        >
          Go back to Upload
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center mt-16 gap-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Document Preview</h2>

      {loading ? <Loader /> : <PlaceholderPreview values={values} />}

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
