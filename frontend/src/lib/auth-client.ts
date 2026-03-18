import { createAuthClient } from "better-auth/react";
import type { SessionUser } from "./types";

const apiUrl = import.meta.env.VITE_API_URL || "/backend";

export const authClient = createAuthClient({
  baseURL: `${window.location.origin}${apiUrl}/auth`,
});

export const { useSession, signIn, signUp, signOut } = authClient;

/** Typed wrapper – returns `session.user` cast to our `SessionUser` type. */
export function useTypedSession() {
  const { data: session, isPending } = useSession();
  const user = session?.user as unknown as SessionUser | undefined;
  return { user, isPending, session };
}
