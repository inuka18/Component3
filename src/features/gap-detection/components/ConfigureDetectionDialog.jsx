import { useState } from "react";
import { Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";

const DEFAULT_WEIGHTS = {
  semanticSimilarity: 70,
  evidenceRecency: 50,
  resourceVariance: 25,
};

const WEIGHT_FIELDS = [
  {
    key: "semanticSimilarity",
    label: "Semantic Similarity Threshold",
    hint: "How closely execution evidence must match requirement wording before it's treated as coverage.",
  },
  {
    key: "evidenceRecency",
    label: "Evidence Recency Weight",
    hint: "How much recent evidence outweighs older evidence when scoring a comparison.",
  },
  {
    key: "resourceVariance",
    label: "Resource Variance Threshold",
    hint: "Capacity deviation (planned vs available) required before a Resource gap is flagged.",
  },
];

function WeightSlider({ label, hint, value, onChange, disabled }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <span className="text-xs font-semibold text-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full accent-primary disabled:cursor-not-allowed"
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

// A placeholder settings surface, the calibration weights here don't yet
// feed into anything real, since Run Gap Detection is itself a simulation.
// This exists to show what detection configuration will look like once a
// real pipeline is behind it.
export function ConfigureDetectionDialog({ isPM }) {
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings2 className="h-4 w-4" />
          Configure Detection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Detection</DialogTitle>
          <DialogDescription>
            Placeholder settings, full detection configuration will be available in a future iteration.
          </DialogDescription>
        </DialogHeader>

        {isPM ? (
          <div className="space-y-5">
            {WEIGHT_FIELDS.map(({ key, label, hint }) => (
              <WeightSlider
                key={key}
                label={label}
                hint={hint}
                value={weights[key]}
                onChange={(v) => setWeights((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div tabIndex={0} className="space-y-5 opacity-60">
                {WEIGHT_FIELDS.map(({ key, label, hint }) => (
                  <WeightSlider key={key} label={label} hint={hint} value={weights[key]} disabled />
                ))}
              </div>
            </TooltipTrigger>
            <TooltipContent>Only Project Managers can adjust calibration weights</TooltipContent>
          </Tooltip>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
