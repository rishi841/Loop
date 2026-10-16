import { signOut } from "@/lib/auth";

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        action={async () => {
          "use server";

          await signOut({
            redirectTo: "/login",
          });
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-black px-6 py-3 text-white"
        >
          Logout
        </button>
      </form>
    </main>
  );
}