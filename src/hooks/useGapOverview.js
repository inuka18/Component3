import { useEffect, useState } from "react";
import { fetchGapOverviewMetrics, fetchModelHealth } from "../services/gapDetectionService";

// Bundles everything the Overview page needs (KPIs, recent alerts, and
// model health) into one hook, same shape as
// useDashboardSummary/useGlobalOverview elsewhere in this app.
export function useGapOverview(projectId) {
  const [metrics, setMetrics] = useState(null);
  const [modelHealth, setModelHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchGapOverviewMetrics(projectId), fetchModelHealth()])
      .then(([metricsRes, modelHealthRes]) => {
        if (cancelled) return;
        setMetrics(metricsRes);
        setModelHealth(modelHealthRes);
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

  return { metrics, modelHealth, setModelHealth, loading, error };
}
