export const LOGGABLE_DATA = [
  "Goals",
  "Blocks",
  "Days",
  "Workouts",
  "Exercises",
  "Records",
] as const;

export type LoggableData = (typeof LOGGABLE_DATA)[number];
