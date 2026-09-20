import { useEffect, useState } from "react";
import { fetchMeetings } from "../services/meetingsService";

export function useMeetings(projectId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMeetings(projectId)
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

  // Exposes a setter too: the "Schedule Meeting" dialog appends a new
  // meeting to local state so it appears in the list immediately. A real
  // backend integration would instead re-fetch or optimistically patch
  // through a mutation call here, without the page needing to change.
  return { data, setData, loading, error };
}
