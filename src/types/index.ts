// Strength
export interface Goal {
  goal: string;
  blocks: Block[];
}

// Strength accumulation 2
export interface Block {
  name: string;
  description: string;
  days: Day[];
}

// Day 1 - upper
export interface Day {
  name: string;
  workout: Workout[];
}

// Week 1
export interface Workout {
  name: string;
  exercises: Exercise[];
}

// Squat
export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
  records: Record[];
}

export interface Record {
  weight: number | string; // Weight lifted in kg
}
