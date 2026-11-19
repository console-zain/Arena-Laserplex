import { AdminForm } from "@/components/admin/admin-form";
import { requireAdmin } from "@/server/auth/guards";

export default async function AdminProfilePage() {
  const { user } = await requireAdmin();
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="m-0 text-xl font-semibold">Admin profile</h2>
        <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
          The signed-in administrator profile for this workspace.
        </p>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <span className="grid size-14 place-items-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
          {initials}
        </span>
        <div>
          <p className="m-0 font-semibold">{user.name}</p>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            {user.email} · Administrator
          </p>
        </div>
      </div>
      <AdminForm
        fields={[
          { name: "name", label: "Name", type: "text", value: user.name, required: true },
          { name: "email", label: "Email", type: "email", value: user.email, required: true },
        ]}
        submitLabel="Save profile"
        title="Profile settings"
      />
    </div>
  );
}
