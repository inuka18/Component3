import { useEffect, useState } from "react";
import { fetchNotifications } from "../services/notificationsService";

export function useNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications().then((res) => {
      if (!cancelled) setData(res);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const markAllRead = () => setData((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) =>
    setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const unreadCount = data.filter((n) => !n.read).length;

  return { data, loading, unreadCount, markAllRead, markRead };
}
