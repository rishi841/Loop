import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top navigation */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
           <div>
  <p className="text-lg font-bold text-white">LOOP</p>
  <p className="text-[10px] text-slate-500">
    Customer Feedback Intelligence
  </p>
</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {session.user.name}
              </p>

              <p className="text-xs text-slate-500">
                {session.user.role}
              </p>
            </div>

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
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-slate-500">
            Dashboard
          </p>

          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name}
          </h1>

          <p className="mt-2 text-slate-400">
            Your customer feedback intelligence workspace.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Feedback"
            value="0"
            description="No feedback yet"
          />

          <StatCard
            label="Positive"
            value="0"
            description="Positive feedback"
          />

          <StatCard
            label="Neutral"
            value="0"
            description="Neutral feedback"
          />

          <StatCard
            label="Negative"
            value="0"
            description="Negative feedback"
          />
        </div>

        {/* Workspace information */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              Workspace
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your current LOOP workspace
            </p>

            <div className="mt-6 space-y-4">
              <InfoRow
                label="Workspace ID"
                value={session.user.workspaceId}
              />

              <InfoRow
                label="Your role"
                value={session.user.role}
              />

              <InfoRow
                label="Account email"
                value={session.user.email ?? "Not available"}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">
              What's next?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your workspace is ready.
            </p>

            <div className="mt-6 rounded-lg border border-dashed border-slate-700 p-6">
              <p className="text-sm text-slate-400">
                Feedback ingestion and analytics will appear
                here once we start importing customer feedback.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-all text-sm text-slate-300">
        {value}
      </p>
    </div>
  );
}