import { User, Session } from "@supabase/supabase-js";
import { DEV_MODE, DEV_USER_ID, DEV_USER_EMAIL } from "@/lib/devConfig";

export function useAuth() {
  // In dev mode, return a mock user immediately
  if (DEV_MODE) {
    const mockUser = {
      id: DEV_USER_ID,
      email: DEV_USER_EMAIL,
      aud: "authenticated",
      role: "authenticated",
    } as User;

    const mockSession = {
      access_token: "dev-token",
      refresh_token: "dev-refresh",
      user: mockUser,
    } as Session;

    return {
      user: mockUser,
      session: mockSession,
      loading: false,
      signOut: async () => {
        console.log("Dev mode: signOut called");
      },
    };
  }

  // Production code would go here
  return { user: null, session: null, loading: false, signOut: async () => {} };
}