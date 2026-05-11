import { Input, Label } from "@/components/ui/Field";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { loginAction } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form action={loginAction} className="w-full max-w-md rounded-[2rem] border border-ink/10 bg-white p-8 shadow-2xl shadow-ink/10">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-rust">Secure desk</p>
        <h1 className="mt-3 font-serif text-4xl font-black text-ink">Admin login</h1>
        {error ? <p className="mt-4 rounded-2xl bg-rust/10 p-3 text-sm font-bold text-rust">Invalid email or password.</p> : null}
        <div className="mt-6 space-y-5">
          <div><Label>Email</Label><Input name="email" type="email" required /></div>
          <div><Label>Password</Label><Input name="password" type="password" minLength={8} required /></div>
          <SubmitButton>Enter dashboard</SubmitButton>
        </div>
      </form>
    </div>
  );
}
