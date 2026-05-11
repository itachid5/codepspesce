import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) return <div className="min-h-screen bg-paper">{children}</div>;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/admin" className="font-serif text-2xl font-black text-ink">Admin Desk</Link>
          <nav className="flex items-center gap-4 text-sm font-bold text-ink/65">
            <Link href="/admin/posts" className="hover:text-rust">Posts</Link>
            <Link href="/admin/categories" className="hover:text-rust">Categories</Link>
            <Link href="/admin/tags" className="hover:text-rust">Tags</Link>
            <Link href="/" className="hover:text-rust">Site</Link>
            <form action={logoutAction}><button className="rounded-full border border-ink/15 px-4 py-2 hover:border-rust hover:text-rust">Logout</button></form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
