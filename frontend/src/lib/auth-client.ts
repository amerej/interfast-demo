import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL || "/backend";

export const authClient = createAuthClient({
  baseURL: `${window.location.origin}${apiUrl}/auth`,
});

export const { useSession, signIn, signUp, signOut } = authClient;
