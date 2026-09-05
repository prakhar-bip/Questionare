import { useCallback, useEffect, useState } from "react";
import { emptyJourney, type JourneyState } from "./types";

const KEY = "questline.journey.v1";

export function useJourney() {
  const [state, setState] = useState<JourneyState>(emptyJourney);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...emptyJourney, ...(JSON.parse(raw) as JourneyState) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<JourneyState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage full or blocked */
      }
      return next;
    });
  }, []);

  const award = useCallback(
    (xp: number, badge?: string) => {
      setState((prev) => {
        const next: JourneyState = {
          ...prev,
          xp: prev.xp + xp,
          badges: badge && !prev.badges.includes(badge) ? [...prev.badges, badge] : prev.badges,
        };
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setState(emptyJourney);
  }, []);

  return { state, update, award, reset, hydrated };
}
