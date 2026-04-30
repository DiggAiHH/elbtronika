import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-[#0a0a0b]">
      <h1 className="text-4xl font-bold tracking-tight text-white">404</h1>
      <p className="max-w-md text-zinc-400">
        This page could not be found. It might have been moved or deleted.
      </p>
      <Link
        href="/"
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
