// @ts-ignore
import "./globals.css";
// /app/layout.tsx
import Link from "next/link";

export const metadata = {
  title: "Lexsy AI Legal Assistant",
  description: "AI-powered legal document assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-semibold text-blue-600 hover:text-blue-800"
          >
            Lexsy AI Legal Assistant
          </Link>
          <nav className="space-x-4 text-sm font-medium">
            <Link href="/upload" className="hover:text-blue-600">
              Upload
            </Link>
            <Link href="/chat" className="hover:text-blue-600">
              Chat
            </Link>
            <Link href="/preview" className="hover:text-blue-600">
              Preview
            </Link>
          </nav>
        </header>
        <main className="flex-grow p-6">{children}</main>
      </body>
    </html>
  );
}
