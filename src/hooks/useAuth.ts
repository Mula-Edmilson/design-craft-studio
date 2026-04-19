import { useEffect, useState, useCallback } from "react";
import { getUser, isLoggedIn, type AppUser } from "@/lib/api";

export function useAuth() {
  const [user, setUserState] = useState<AppUser | null>(() => getUser());
  const [authed, setAuthed] = useState<boolean>(() => isLoggedIn());

  const refresh = useCallback(() => {
    setUserState(getUser());
    setAuthed(isLoggedIn());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("pp:authChanged", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("pp:authChanged", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return { user, authed, refresh };
}
