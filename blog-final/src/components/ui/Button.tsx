import Link from "next/link";
import { cn } from "@/lib/utils";

const styles = "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(styles, "bg-ink text-paper hover:bg-rust focus:ring-rust", className)} {...props} />;
}

export function LinkButton({ className, href, children }: { className?: string; href: string; children: React.ReactNode }) {
  return <Link href={href} className={cn(styles, "bg-ink text-paper hover:bg-rust", className)}>{children}</Link>;
}
