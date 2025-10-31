import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-100 shadow-sm py-3">
      <nav className="max-w-4xl mx-auto flex justify-between items-center px-4">
        <h1 className="text-xl font-semibold text-blue-700">
          Lexsy AI Legal Assistant
        </h1>
        <div className="space-x-4 text-sm">
          <Link href="/upload" className="hover:text-blue-600">
            Upload
          </Link>
          <Link href="/chat" className="hover:text-blue-600">
            Chat
          </Link>
          <Link href="/preview" className="hover:text-blue-600">
            Preview
          </Link>
        </div>
      </nav>
    </header>
  );
}
