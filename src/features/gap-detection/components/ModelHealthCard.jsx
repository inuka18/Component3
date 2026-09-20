import { useEffect, useState } from "react";
import { Cpu, RefreshCw, Database, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { RestrictedButton } from "./RestrictedButton";
import { retrainModel } from "../../../services/gapDetectionService";
import { formatDateTime } from "../../../lib/utils";
import { cn } from "../../../lib/utils";

const RETRAIN_STEPS = [
  "Collecting validated retrospective records...",
  "Updating training dataset...",
  "Retraining XGBoost...",
  "Model updated successfully.",
];

// No backend exists to actually retrain a model, so this simulates one:
// a short sequential status message, then mutates the shared
// mockModelHealth object (version bump, folded-in C4 instances, nudged
// F1) via gapDetectionService.retrainModel so the change is visible
// anywhere else this data is read. Explicitly labeled a simulation.
export function ModelHealthCard({ modelHealth, onModelHealthChange, isPM }) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [retraining, setRetraining] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!modelHealth) return null;

  const handleRetrain = async () => {
    setRetraining(true);
    for (let i = 0; i < RETRAIN_STEPS.length - 1; i++) {
      setStepIndex(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 650));
    }
    const updated = await retrainModel();
    setStepIndex(RETRAIN_STEPS.length - 1);
    await new Promise((r) => setTimeout(r, 500));
    onModelHealthChange(updated);
    setRetraining(false);
    setStepIndex(-1);
    setToast(`Model retrained, now ${updated.version}.`);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Model Health</CardTitle>
              <CardDescription>{modelHealth.modelName} ({modelHealth.modelFamily})</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
            {modelHealth.version}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Training Instances</dt>
              <dd className="mt-0.5 font-semibold text-foreground">
                {modelHealth.trainingInstances.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">F1 Score</dt>
              <dd className="mt-0.5 font-semibold text-foreground">{modelHealth.f1Score}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last Retrained</dt>
              <dd className="mt-0.5 font-semibold text-foreground">{formatDateTime(modelHealth.lastRetrained)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">New Training Instances</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-foreground">
                <Database className="h-3.5 w-3.5 text-primary" />
                {modelHealth.newC4Instances}
              </dd>
            </div>
          </dl>

          {retraining && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {RETRAIN_STEPS[stepIndex]}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {isPM ? (
              <Button variant="outline" size="sm" onClick={handleRetrain} disabled={retraining}>
                <RefreshCw className={cn("h-4 w-4", retraining && "animate-spin")} />
                Retrain from Retrospective Data
              </Button>
            ) : (
              <RestrictedButton label="Only Project Managers can retrain the classifier">
                <RefreshCw className="h-4 w-4" />
                Retrain from Retrospective Data
              </RestrictedButton>
            )}
            <Button variant="ghost" size="sm">
              <Database className="h-4 w-4" />
              View Training Data
            </Button>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            Prototype simulation, actual model training requires backend implementation.
          </p>
        </CardContent>
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-status-confirmed-fg" />
          {toast}
        </div>
      )}
    </>
  );
}
