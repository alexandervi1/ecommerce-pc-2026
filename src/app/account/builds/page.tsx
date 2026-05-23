import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPCBuildsByUserId } from "@/lib/repositories";
import BuildsListClient from "./builds-list-client";

interface Build {
  id: string;
  name: string;
  totalPrice: number;
  createdAt: string;
}

export const dynamic = "force-dynamic";

export default async function BuildsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const builds = await getPCBuildsByUserId(session.user.id);
  
  const serializedBuilds: Build[] = (builds as { id: string; name: string; totalPrice: number; createdAt: Date }[]).map((b) => ({
    id: b.id,
    name: b.name,
    totalPrice: b.totalPrice,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt),
  }));

  return <BuildsListClient initialBuilds={serializedBuilds} />;
}