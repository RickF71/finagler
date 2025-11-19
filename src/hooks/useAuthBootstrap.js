// src/hooks/useAuthBootstrap.js
import { useEffect, useState } from "react";
import { getMe } from "../lib/api";

/**
 * useAuthBootstrap - Check authentication before mounting the main app
 * 
 * This hook prevents the Finagler app from rendering until the user
 * is authenticated with DIS-Core. If /api/me returns 401, the user
 * is redirected to None Space (/none) to select an identity.
 * 
 * @returns {Object} { booting: boolean, authed: boolean }
 */
export function useAuthBootstrap() {
  const [booting, setBooting] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        // Try to fetch user identity from DIS-Core
        // This will 401 if not authenticated, triggering redirect to /none
        await getMe();
        setAuthed(true);
        console.log("✅ Auth bootstrap: User authenticated");
      } catch (e) {
        // User is not authenticated
        setAuthed(false);
        console.warn("🚫 Auth bootstrap: User not authenticated");
      } finally {
        setBooting(false);
      }
    }
    check();
  }, []);

  return { booting, authed };
}
