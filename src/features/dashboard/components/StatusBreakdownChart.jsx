import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { useTheme } from "../../../context/ThemeContext";

// Recharts renders <Cell> fills as plain SVG `fill` attributes, which can't
// resolve `var(--…)`, so each status gets an explicit hex per theme here,
// chosen to match the hue of the equivalent status badge in index.css.
const STATUS_STYLE = {
  Confirmed: { light: "#16a34a", dark: "#4ade80", dotClass: "bg-status-confirmed-fg" },
  "At Risk": { light: "#d97706", dark: "#fbbf24", dotClass: "bg-status-atrisk-fg" },
  Modified: { light: "#0284c7", dark: "#38bdf8", dotClass: "bg-status-modified-fg" },
  Dropped: { light: "#dc2626", dark: "#f87171", dotClass: "bg-status-dropped-fg" },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { status, count } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-popover-foreground">{status}</p>
      <p className="text-muted-foreground">{count} requirement{count === 1 ? "" : "s"}</p>
    </div>
  );
}

export function StatusBreakdownChart({ data, loading, projectName }) {
  const { theme } = useTheme();
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements by Live Status</CardTitle>
        <CardDescription>
          Real-time status distribution across tracked requirements{projectName ? ` for ${projectName}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-6">
            <Skeleton className="h-40 w-40 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_STYLE[entry.status][theme]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{total}</span>
                <span className="text-[11px] text-muted-foreground">total</span>
              </div>
            </div>

            <div className="w-full flex-1 space-y-2.5">
              {data.map((entry) => {
                const pct = total ? Math.round((entry.count / total) * 100) : 0;
                return (
                  <div key={entry.status} className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_STYLE[entry.status].dotClass}`} />
                    <span className="flex-1 text-sm text-foreground">{entry.status}</span>
                    <span className="text-sm font-semibold text-foreground">{entry.count}</span>
                    <span className="w-10 text-right text-xs text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
