import { logout } from "@/app/(auth)/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        Log out
      </button>
    </form>
  );
}
