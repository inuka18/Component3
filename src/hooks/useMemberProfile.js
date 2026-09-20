import { useEffect, useState } from "react";
import { fetchMemberProfile } from "../services/memberProfileService";

export function useMemberProfile(member, { allProjects, extraTeamForProject }) {
  const [data, setData] = useState({ projects: [], activity: [], actionItems: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!member) {
      setData({ projects: [], activity: [], actionItems: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchMemberProfile({ member, allProjects, extraTeamForProject }).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [member, allProjects, extraTeamForProject]);

  return { data, setData, loading };
}
