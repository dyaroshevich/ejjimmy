export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900 rounded-full animate-spin border-t-orange-600 dark:border-t-orange-500" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 animate-pulse">กำลังโหลด…</p>
          <p className="text-xs text-slate-400 dark:text-slate-400">กรุณารอสักครู่</p>
        </div>
      </div>
    </div>
  );
}
