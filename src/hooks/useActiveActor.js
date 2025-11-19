// src/hooks/useActiveActor.js
import { useState, useCallback } from "react";
import { getActiveActor, setActiveActor as setActiveActorAPI } from "../lib/api.js";

export function useActiveActor() {
  const [activeActor, setActiveActorState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load the current active actor from the backend
  const loadActiveActor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveActor();
      if (data.has_active_actor && data.active_seat_id) {
        setActiveActorState({
          seatId: data.active_seat_id,
          hasActiveActor: data.has_active_actor
        });
      } else {
        setActiveActorState(null);
      }
      return data;
    } catch (err) {
      console.error("Failed to load active actor:", err);
      setError(err.message || "Failed to load active actor");
      setActiveActorState(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set a new active actor by seat ID
  const setActiveActor = useCallback(async (seatId, { onSuccess, onReload } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await setActiveActorAPI(seatId);
      if (data.ok && data.active_seat_id) {
        setActiveActorState({
          seatId: data.active_seat_id,
          hasActiveActor: true
        });
        
        // Call success callback if provided
        if (onSuccess) {
          await onSuccess(data);
        }
        
        // Call reload callback if provided (for reloading /api/me, /api/me/actors, domains, etc.)
        if (onReload) {
          await onReload();
        }
        
        return data;
      } else {
        throw new Error(data.message || "Failed to set active actor");
      }
    } catch (err) {
      console.error("Failed to set active actor:", err);
      setError(err.message || "Failed to set active actor");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activeActor,
    loading,
    error,
    loadActiveActor,
    setActiveActor
  };
}
