"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { type LoginState, login } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="tag w-full border border-amber bg-amber px-6 py-4 text-ferro transition-colors hover:bg-transparent hover:text-amber disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Verificando…" : "Entrar"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="username" className="tag mb-2 block text-blueline">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoFocus
          className="w-full border border-blueline/50 bg-ferro px-4 py-3 font-mono text-sm text-chalk outline-none transition-colors focus:border-cyan"
        />
      </div>

      <div>
        <label htmlFor="password" className="tag mb-2 block text-blueline">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-blueline/50 bg-ferro px-4 py-3 font-mono text-sm text-chalk outline-none transition-colors focus:border-cyan"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm text-amber"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
