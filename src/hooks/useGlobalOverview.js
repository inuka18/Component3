import { useEffect, useState } from "react";
import { fetchGlobalOverview } from "../services/overviewService";

export function useGlobalOverview({ projects, currentUser, isPM, extraTeamForProject }) {
  const [data, setData] = useState({ sprints: [], capacity: [], meetings: [], activity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGlobalOverview({ projects, currentUser, isPM, extraTeamForProject }).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projects, currentUser, isPM, extraTeamForProject]);

  return { data, loading };
}
