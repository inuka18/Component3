import { useEffect, useState } from "react";
import { fetchTasks } from "../services/scheduleService";

export function useSchedule(projectId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTasks(projectId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Exposed so the "Log Time" dialog can append a time log (and move a
  // task's column) in local state, same swap-later contract as useMeetings.
  return { data, setData, loading, error };
}
