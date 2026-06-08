import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "employee";

export type CurrentStaff = {
  id: string;
  email: string | null;
  role: Role;
};

// Returns the logged-in staff member and their role, or null if not signed in.
// `admin` is the owner (full control); `employee` is limited to product entry.
export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    role: (profile?.role as Role) ?? "employee",
  };
}
