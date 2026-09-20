// Gap Classifier model metadata for the Overview page's Model Health card.
// A single shared model serving every project (not project-scoped),
// matching how a real ML service would sit behind the whole system rather
// than being retrained per-project. `newC4Instances` counts validated
// retrospective outcomes folded in since the last retrain: the training
// signal this classifier retrains from.

export const mockModelHealth = {
  modelName: "Gap Classifier",
  modelFamily: "XGBoost",
  version: "v2.3.1",
  trainingInstances: 4820,
  f1Score: 0.87,
  lastRetrained: "2026-08-19T09:00:00+05:30",
  newC4Instances: 136,
};
