import { LoggableData } from "./consts/types";
import { Block, Day, Exercise, Goal, Workout } from "./types";

import { input, select } from "@inquirer/prompts";

export class Logger {
  data: Goal[];
  goal: Goal | null = null;
  block: Block | null = null;
  day: Day | null = null;
  workout: Workout | null = null;
  exercise: Exercise | null = null;

  constructor(data: Goal[]) {
    this.data = data;
  }

  async handleNewGoal() {
    // Add new goal to the root of the data structure
    const goalName = await input({
      message: "Enter the name of the new goal:",
    });
    const newGoal: Goal = {
      goal: goalName,
      blocks: [],
    };
    this.data.push(newGoal);
    console.log(`New goal "${goalName}" added successfully!`);
  }

  async askForGoalByName(): Promise<Goal | undefined> {
    const goalChoices = this.data.map((goal, index) => ({
      name: goal.goal,
      value: index,
    }));
    const answer = await select({
      message: `Select the goal to add to:`,
      choices: [...goalChoices, { name: "Create New Goal", value: -1 }], // Add option to create a new goal
    });
    if (answer === -1) {
      await this.handleNewGoal();
      return undefined;
    }
    return this.data[answer];
  }

  async handleNewBlock(goal: Goal) {
    const blockName = await input({
      message: "Enter the name of the new block:",
    });
    const blockDescription = await input({
      message: "Enter a description for the new block:",
    });
    const newBlock: Block = {
      name: blockName,
      description: blockDescription,
      days: [],
    };
    goal.blocks.push(newBlock);
    console.log(
      `New block "${blockName}" added successfully to goal "${goal.goal}"!`,
    );
  }

  async askForBlockByName(): Promise<number | undefined> {
    const blockChoices = this.goal!.blocks.map((block, index) => ({
      name: block.name,
      value: index,
    }));
    const answer = await select({
      message: `Select the block to add to:`,
      choices: [...blockChoices, { name: "Create New Block", value: -1 }], // Add option to create a new block
    });
    if (answer === -1) {
      await this.handleNewBlock(this.goal!);
      return undefined;
    }
    return answer as number;
  }

  async handleNewDay(block: Block) {
    const dayName = await input({
      message: "Enter the name of the new day (eg: Day 1 - Upper):",
    });
    const newDay = {
      name: dayName,
      workout: [],
    };
    block.days.push(newDay);
    console.log(
      `New day "${dayName}" added successfully to block "${block.name}"!`,
    );
  }

  async askForDayByName(): Promise<number | undefined> {
    const dayChoices = this.block!.days.map((day, index) => ({
      name: day.name,
      value: index,
    }));
    const answer = await select({
      message: `Select the day to add to:`,
      choices: [...dayChoices, { name: "Create New Day", value: -1 }], // Add option to create a new day
    });
    if (answer === -1) {
      await this.handleNewDay(this.block!);
      return undefined;
    }
    return answer as number;
  }

  async handleNewWorkout(day: Day) {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const workoutName = await select({
      message: "Enter the name of the new workout:",
      choices: weeks.map((week) => ({ name: week, value: week })),
    });
    const newWorkout = {
      name: workoutName,
      exercises: [],
    };
    day.workout.push(newWorkout);
    console.log(
      `New workout "${workoutName}" added successfully to day "${day.name}"!`,
    );
  }

  async askForWorkoutByName(): Promise<number | undefined> {
    const workoutChoices = this.day!.workout.map((workout, index) => ({
      name: workout.name,
      value: index,
    }));
    const answer = await select({
      message: `Select the workout to add to:`,
      choices: [...workoutChoices, { name: "Create New Workout", value: -1 }], // Add option to create a new workout
    });
    if (answer === -1) {
      await this.handleNewWorkout(this.day!);
      return undefined; // New workout was created, no need to proceed further
    }
    return answer as number;
  }

  async handleNewExercise(workout: Workout) {
    const exerciseName = await input({
      message: "Enter the name of the new exercise:",
    });
    const exerciseDescription = await input({
      message: "Enter a description for the new exercise:",
    });
    const sets = await input({
      message: "Enter the number of sets:",
      validate: (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) || parsed <= 0
          ? "Please enter a valid positive number for sets."
          : true;
      },
    });
    const reps = await input({
      message: "Enter the number of reps:",
      validate: (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) || parsed <= 0
          ? "Please enter a valid positive number for reps."
          : true;
      },
    });
    const newExercise = {
      name: exerciseName,
      description: exerciseDescription,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      records: [],
    };
    workout.exercises.push(newExercise);
    console.log(
      `New exercise "${exerciseName}" added successfully to workout "${workout.name}"!`,
    );
  }

  async askForExerciseByName(): Promise<number | undefined> {
    const exerciseChoices = this.workout!.exercises.map((exercise, index) => ({
      name: exercise.name,
      value: index,
    }));
    const answer = await select({
      message: `Select the exercise to add to:`,
      choices: [...exerciseChoices, { name: "Create New Exercise", value: -1 }], // Add option to create a new exercise
    });
    if (answer === -1) {
      await this.handleNewExercise(this.workout!);
      return undefined; // New exercise was created, no need to proceed further
    }
    return answer as number;
  }

  async setRecord(exercise: Exercise) {
    const weight = await input({
      message: "Enter the weight lifted (in kg):",
      validate: (value) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) || parsed <= 0
          ? "Please enter a valid positive number for weight."
          : true;
      },
    });
    const reps = await input({
      message: "Enter the number of reps performed:",
      validate: (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) || parsed <= 0
          ? "Please enter a valid positive number for reps."
          : true;
      },
    });
    const notes = await input({
      message: "Any additional notes about this workout session? (optional)",
    });
    const newRecord = {
      weight: parseFloat(weight),
      reps: parseInt(reps, 10),
      notes: notes.trim() === "" ? undefined : notes.trim(),
    };
    exercise.records.push(newRecord);
    console.log(
      `New record added successfully to exercise "${exercise.name}"!`,
    );
  }

  async handleUserInput() {
    const goal = await this.askForGoalByName();
    if (!goal) {
      return; // New goal was created, no need to proceed further
    }
    this.goal = goal;

    const blockIndex = await this.askForBlockByName();
    if (blockIndex === undefined) {
      return; // New block was created, no need to proceed further
    }
    this.block = this.goal.blocks[blockIndex] as Block;

    const dayIndex = await this.askForDayByName();
    if (dayIndex === undefined) {
      return; // New day was created, no need to proceed further
    }
    this.day = this.block.days[dayIndex] as Day;

    const workoutIndex = await this.askForWorkoutByName();
    if (workoutIndex === undefined) {
      return; // New workout was created, no need to proceed further
    }
    this.workout = this.day.workout[workoutIndex] as Workout;

    const exerciseIndex = await this.askForExerciseByName();
    if (exerciseIndex === undefined) {
      return; // New exercise was created, no need to proceed further
    }

    const exercise = this.workout.exercises[exerciseIndex] as Exercise;
    this.exercise = exercise;

    await this.setRecord(exercise);

    this.logData();
  }

  logData() {
    console.log("Current Data:", JSON.stringify(this.data, null, 2));
  }
}
