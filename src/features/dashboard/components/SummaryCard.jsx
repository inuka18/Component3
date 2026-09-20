import { Link } from "react-router-dom";
import { ArrowUpRight, FileStack, Columns3, Users2, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const ICONS = {
  requirements: FileStack,
  schedule: Columns3,
  team: Users2,
  retrospectives: History,
};

export function SummaryCard({ item }) {
  const Icon = ICONS[item.id] ?? FileStack;

  return (
    <Link to={item.to} className="group block h-full">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <CardTitle className="text-base">{item.title}</CardTitle>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-foreground">{item.metricLabel}</span>
            <span className="text-xs text-muted-foreground">{item.subMetricLabel}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
