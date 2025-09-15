import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";

export default async function Header() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <Link href={user ? `/dashboard` : `/`}>ExTrack</Link>
        </h1>

        <div className="flex items-center gap-4">
          {user ? (
            // Show Add and Logout buttons when user is authenticated
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/add-expense">Add</Link>
              </Button>
              <form>
                <Button formAction={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            // Show Login button when user is not authenticated
            <Button variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
