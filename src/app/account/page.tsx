import { auth } from "@/lib/auth";
import { ClientDashboard } from "@/components/user/dashboard";
import { EmptySession } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[oklch(15%_0.02_260)] text-[oklch(92%_0.01_250)] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <EmptySession />
        </div>
      </div>
    );
  }

  return <ClientDashboard />;
}