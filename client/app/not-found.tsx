import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-900">
      <h1 className="text-6xl font-bold text-zinc-900 dark:text-white">404</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Trang bạn tìm không tồn tại.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
