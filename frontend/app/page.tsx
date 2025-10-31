"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center text-center h-[calc(100vh-100px)] bg-gradient-to-b from-blue-50 via-white to-blue-100 overflow-hidden">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">
        Automate Legal Docs with <span className="text-blue-900">Lexsy AI</span>
      </h1>

      <p className="text-gray-700 max-w-xl mx-auto mb-8 leading-relaxed text-lg">
        Upload your Word template, chat naturally with Lexsy AI to fill in every
        field, and download a perfectly formatted document — all in one flow.
      </p>

      <Link
        href="/upload"
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg shadow hover:bg-blue-700 transition-transform transform hover:scale-105"
      >
        Try Assistant 🚀
      </Link>

      <footer className="absolute bottom-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Lexsy AI — Built for smart document
        automation
      </footer>
    </div>
  );
}
