import { User, Session } from "@supabase/supabase-js";

// DEV MODE: Bypass authentication for development
const DEV_MODE = true;
const DEV_USER_ID = "19b14a87-979d-4a60-b7ec-5994ce3bfac0";
const DEV_USER_EMAIL = "pintar80@gmail.com";

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