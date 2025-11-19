// src/hooks/useMeActors.js
import { useState, useCallback } from "react";
import { getMeActors } from "../lib/api.js";

export function useMeActors() {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all actors/seats from /api/me/actors
  const loadActors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeActors();
      const actorsList = data.actors || [];
      setActors(actorsList);
      return actorsList;
    } catch (err) {
      console.error("Failed to load /api/me/actors:", err);
      setError(err.message || "Failed to load actors");
      setActors([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    actors,
    loading,
    error,
    loadActors
  };
}
