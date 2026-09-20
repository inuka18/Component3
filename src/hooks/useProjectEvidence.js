import { useEffect, useState } from "react";
import { fetchEvidenceForProject } from "../services/evidenceService";

// Distinct from useEvidence (which scopes to one action). This fetches
// every evidence item across a project's actions, for the Overview KPIs
// and the Learning Loop gate checklist.
export function useProjectEvidence(projectId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEvidenceForProject(projectId)
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

  return { data, setData, loading, error };
}
