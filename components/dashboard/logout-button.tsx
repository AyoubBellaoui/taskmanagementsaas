import { logout } from "@/app/(auth)/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-white/5"
      >
        Log out
      </button>
    </form>
  );
}
