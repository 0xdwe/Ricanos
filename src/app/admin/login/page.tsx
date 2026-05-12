import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-slate-600">
          Enter your admin credentials to manage events.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
