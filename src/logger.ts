import { LoggableData } from "./consts/types";
import { Block, Day, Exercise, Goal, Workout, Record } from "./types";

import { input, select } from "@inquirer/prompts";

const SELECTION_STATUS = {
  EXIT: "Exit",
  GO_BACK: "Go back",
  SELECTED: "Selected",
  CREATE_NEW: "Create New",
  OVERWRITE: "Overwrite",
  IMPORTED_EXERCISES: "Imported Exercises",
} as const;

interface SelectionResult<T> {
  status: (typeof SELECTION_STATUS)[keyof typeof SELECTION_STATUS];
  value: T | null;
}

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
    this.goal = newGoal; // Set the newly created goal as the current goal
    console.log(`New goal "${goalName}" added successfully!`);
  }

  async askForGoalByName(): Promise<SelectionResult<Goal>> {
    const goalChoices = this.data.map((goal, index) => ({
      name: goal.goal,
      value: index,
    })) as { name: string; value: number | string }[];
    const answer = await select({
      message: `Select the goal to add to:`,
      choices: [
        ...goalChoices,
        { name: "Create New Goal", value: SELECTION_STATUS.CREATE_NEW },
        { name: "Exit", value: SELECTION_STATUS.EXIT },
      ], // Add option to create a new goal
      default: this.goal
        ? goalChoices.find((choice) => choice.name === this.goal!.goal)?.value
        : undefined,
      loop: false, // Disable looping to prevent going back to the first option after reaching the end of the list
    });
    if (answer === SELECTION_STATUS.CREATE_NEW) {
      await this.handleNewGoal();
      return { status: SELECTION_STATUS.CREATE_NEW, value: null }; // Return the newly created goal
    } else if (answer === SELECTION_STATUS.EXIT) {
      return { status: SELECTION_STATUS.EXIT, value: null }; // User chose to exit
    }
    return {
      status: SELECTION_STATUS.SELECTED,
      value: this.data[answer as number] as Goal,
    };
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
    this.block = newBlock; // Set the newly created block as the current block
    console.log(
      `New block "${blockName}" added successfully to goal "${goal.goal}"!`,
    );
  }

  async askForBlockByName(): Promise<SelectionResult<number>> {
    const blockChoices = this.goal!.blocks.map((block, index) => ({
      name: block.name,
      value: index,
    })) as { name: string; value: number | string }[];
    const answer = await select({
      message: `Select the block to add to:`,
      choices: [
        ...blockChoices,
        { name: "Create New Block", value: SELECTION_STATUS.CREATE_NEW },
        { name: "Go back to Goals", value: SELECTION_STATUS.GO_BACK },
        { name: "Exit", value: SELECTION_STATUS.EXIT },
      ], // Add option to create a new block
      default: this.block
        ? blockChoices.find((choice) => choice.name === this.block!.name)?.value
        : undefined,
      loop: false, // Disable looping to prevent going back to the first option after reaching the end of the list
    });
    if (answer === SELECTION_STATUS.CREATE_NEW) {
      await this.handleNewBlock(this.goal!);
      return { status: SELECTION_STATUS.CREATE_NEW, value: null };
    } else if (answer === SELECTION_STATUS.GO_BACK) {
      this.goal = null;
      return { status: SELECTION_STATUS.GO_BACK, value: null }; // Signal to go back to goal selection
    } else if (answer === SELECTION_STATUS.EXIT) {
      return { status: SELECTION_STATUS.EXIT, value: null }; // User chose to exit
    }
    return { status: SELECTION_STATUS.SELECTED, value: answer as number };
  }

  generate4WeekWorkoutTemplate = () => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map((week) => ({
      name: week,
      exercises: [],
    }));
  };

  async handleNewDay(block: Block) {
    const daySelector = await select({
      message: "Select the name of the new day:",
      choices: ["Day 1", "Day 2", "Day 3", "Day 4"].map((day) => ({
        name: day,
        value: day,
      })),
    });

    const upperOrLowerSelector = await select({
      message: "Is this an upper or lower body day?",
      choices: [
        { name: "Upper Body", value: "Upper" },
        { name: "Lower Body", value: "Lower" },
      ],
    });

    const dayName = `${daySelector} - ${upperOrLowerSelector}`;

    const newDay = {
      name: dayName,
      workout: this.generate4WeekWorkoutTemplate(), // Initialize with a 4-week workout template
    };
    block.days.push(newDay);
    console.log(
      `New day "${dayName}" added successfully to block "${block.name}"!`,
    );
    this.day = newDay; // Set the newly created day as the current day
  }

  async askForDayByName(): Promise<SelectionResult<number>> {
    const dayChoices = this.block!.days.map((day, index) => ({
      name: day.name,
      value: index,
    })) as { name: string; value: number | string }[];
    const answer = await select({
      message: `Select the day to add to:`,
      choices: [
        ...dayChoices,
        { name: "Create New Day", value: SELECTION_STATUS.CREATE_NEW },
        { name: "Go back to Block", value: SELECTION_STATUS.GO_BACK },
        { name: "Exit", value: SELECTION_STATUS.EXIT },
      ], // Add option to create a new day
      default: this.day
        ? dayChoices.find((choice) => choice.name === this.day!.name)?.value
        : undefined,
      loop: false, // Disable looping to prevent going back to the first option after reaching the end of the list
    });
    if (answer === SELECTION_STATUS.CREATE_NEW) {
      await this.handleNewDay(this.block!);
      return { status: SELECTION_STATUS.CREATE_NEW, value: null };
    } else if (answer === SELECTION_STATUS.GO_BACK) {
      this.block = null;
      return { status: SELECTION_STATUS.GO_BACK, value: null }; // Signal to go back to block selection
    } else if (answer === SELECTION_STATUS.EXIT) {
      return { status: SELECTION_STATUS.EXIT, value: null }; // User chose to exit
    }
    return { status: SELECTION_STATUS.SELECTED, value: answer as number };
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
    this.workout = newWorkout; // Set the newly created workout as the current workout
  }

  async askForWorkoutByName(): Promise<SelectionResult<number>> {
    const workoutChoices = this.day!.workout.map((workout, index) => ({
      name: workout.name,
      value: index,
    })) as { name: string; value: number | string }[];
    const answer = await select({
      message: `Select the workout to add to:`,
      choices: [
        ...workoutChoices,
        { name: "Create New Workout", value: SELECTION_STATUS.CREATE_NEW },
        { name: "Go back to Day", value: SELECTION_STATUS.GO_BACK },
        { name: "Exit", value: SELECTION_STATUS.EXIT },
      ], // Add option to create a new workout
      default: this.workout
        ? workoutChoices.find((choice) => choice.name === this.workout!.name)
            ?.value
        : undefined,
      loop: false, // Disable looping to prevent going back to the first option after reaching the end of the list
    });
    if (answer === SELECTION_STATUS.CREATE_NEW) {
      await this.handleNewWorkout(this.day!);
      return { status: SELECTION_STATUS.CREATE_NEW, value: null }; // New workout was created, no need to proceed further
    } else if (answer === SELECTION_STATUS.GO_BACK) {
      this.day = null;
      return { status: SELECTION_STATUS.GO_BACK, value: null }; // Signal to go back to day selection
    } else if (answer === SELECTION_STATUS.EXIT) {
      return { status: SELECTION_STATUS.EXIT, value: null }; // User chose to exit
    }
    return { status: SELECTION_STATUS.SELECTED, value: answer as number };
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
    this.exercise = newExercise; // Set the newly created exercise as the current exercise
  }

  async askForExerciseByName(): Promise<SelectionResult<number>> {
    const exerciseChoices = this.workout!.exercises.map((exercise, index) => ({
      name: exercise.name,
      value: index,
    })) as { name: string; value: number | string }[];

    // Check if there ane any exercises in sibling workouts to suggest as defaults
    const siblingExercises = this.day!.workout.filter((w) => w !== this.workout) // Get sibling workouts
      .flatMap((w) => w.exercises) // Get exercises from sibling workouts
      .map((exercise) => ({
        name: exercise.name,
        description: exercise.description,
        sets: exercise.sets,
        reps: exercise.reps,
      })); // Get exercise names

    const uniqueSiblingExercises = Array.from(new Set(siblingExercises)); // Get unique exercise names

    if (uniqueSiblingExercises.length > 0 && exerciseChoices.length === 0) {
      const askToImport = await select({
        message: "Would you like to import exercises from sibling workouts?",
        choices: [
          { name: "Yes, import exercises", value: true },
          { name: "No, create a new exercise", value: false },
        ],
      });
      if (askToImport) {
        // If user wants to import, we can add the sibling exercises to the current workout and set the first one as default
        uniqueSiblingExercises.forEach((exercise) => {
          // Check if the exercise already exists in the current workout to avoid duplicates
          if (!this.workout!.exercises.some((e) => e.name === exercise.name)) {
            this.workout!.exercises.push({
              name: exercise.name,
              description: exercise.description,
              sets: exercise.sets,
              reps: exercise.reps,
              records: [],
            });
          }
        });

        return {
          status: SELECTION_STATUS.IMPORTED_EXERCISES,
          value: null,
        };
      }
    }

    const answer = await select({
      message: `Select the exercise to add to for "${this.workout!.name}" at "${this.day!.name}" on "${this.block!.name}" in "${this.goal!.goal}":`,
      choices: [
        ...exerciseChoices,
        { name: "Create New Exercise", value: SELECTION_STATUS.CREATE_NEW },
        { name: "Go back to Workout", value: SELECTION_STATUS.GO_BACK },
        { name: "Exit", value: SELECTION_STATUS.EXIT },
      ], // Add option to create a new exercise
      default: this.exercise
        ? exerciseChoices.find((choice) => choice.name === this.exercise!.name)
            ?.value
        : undefined,
      loop: false, // Disable looping to prevent going back to the first option after reaching the end of the list
    });
    if (answer === SELECTION_STATUS.CREATE_NEW) {
      await this.handleNewExercise(this.workout!);
      return { status: SELECTION_STATUS.CREATE_NEW, value: null }; // New exercise was created, no need to proceed further
    } else if (answer === SELECTION_STATUS.GO_BACK) {
      this.workout = null;
      return { status: SELECTION_STATUS.GO_BACK, value: null }; // Signal to go back to workout selection
    } else if (answer === SELECTION_STATUS.EXIT) {
      return { status: SELECTION_STATUS.EXIT, value: null }; // User chose to exit
    }
    return { status: SELECTION_STATUS.SELECTED, value: answer as number };
  }

  async setRecord() {
    const numberOfSets = this.exercise!.sets;
    const records = [] as Record[];

    let defaultInput = "";
    for (let set = 1; set <= numberOfSets; set++) {
      const weight = await input({
        message: `Enter the weight lifted for set ${set} (in kg):`,
        default: defaultInput,
        validate: (value) => {
          const parsed = parseFloat(value);
          if (isNaN(parsed)) {
            return true;
          }
          return parsed > 0;
        },
      });
      records.push({
        weight: isNaN(parseFloat(weight)) ? weight.trim() : parseFloat(weight),
      });
      defaultInput = weight; // Update default input for the next set
    }

    this.exercise!.records = records;
    console.log(
      `New record added successfully to exercise "${this.exercise!.name}"!`,
    );
  }

  async handleUserInput() {
    let running = true;
    let currentStep: LoggableData = "Goals";
    while (running) {
      if (currentStep === "Goals") {
        const goal = await this.askForGoalByName();
        if (goal.status === SELECTION_STATUS.EXIT) {
          running = false; // User chose to exit, break the loop
          continue;
        }
        if (goal.status === SELECTION_STATUS.CREATE_NEW) {
          continue; // New goal was created, no need to proceed further
        }
        this.goal = goal.value;
        currentStep = "Blocks"; // Move to the next step after selecting a goal
      } else if (currentStep === "Blocks") {
        const blockIndex = await this.askForBlockByName();
        if (blockIndex.status === SELECTION_STATUS.CREATE_NEW) {
          continue; // New block was created, no need to proceed further
        }
        if (blockIndex.status === SELECTION_STATUS.GO_BACK) {
          currentStep = "Goals"; // User chose to go back to goal selection, restart the loop
          continue;
        }
        if (blockIndex.status === SELECTION_STATUS.EXIT) {
          running = false; // User chose to exit, break the loop
          continue;
        }
        this.block = this.goal!.blocks[blockIndex.value as number] as Block;
        currentStep = "Days"; // Move to the next step after selecting a block
      } else if (currentStep === "Days") {
        const dayIndex = await this.askForDayByName();
        if (dayIndex.status === SELECTION_STATUS.CREATE_NEW) {
          continue; // New day was created, no need to proceed further
        }
        if (dayIndex.status === SELECTION_STATUS.GO_BACK) {
          currentStep = "Blocks"; // User chose to go back to block selection, restart the loop
          continue;
        }
        if (dayIndex.status === SELECTION_STATUS.EXIT) {
          running = false; // User chose to exit, break the loop
          continue;
        }

        this.day = this.block!.days[dayIndex.value as number] as Day;
        currentStep = "Workouts"; // Move to the next step after selecting a day
      } else if (currentStep === "Workouts") {
        const workoutIndex = await this.askForWorkoutByName();
        if (workoutIndex.status === SELECTION_STATUS.CREATE_NEW) {
          continue; // New workout was created, no need to proceed further
        }
        if (workoutIndex.status === SELECTION_STATUS.GO_BACK) {
          currentStep = "Days"; // User chose to go back to day selection, restart the loop
          continue;
        }
        if (workoutIndex.status === SELECTION_STATUS.EXIT) {
          running = false; // User chose to exit, break the loop
          continue;
        }
        this.workout = this.day!.workout[
          workoutIndex.value as number
        ] as Workout;
        currentStep = "Exercises"; // Move to the next step after selecting a workout
      } else if (currentStep === "Exercises") {
        const exerciseIndex = await this.askForExerciseByName();
        if (exerciseIndex.status === SELECTION_STATUS.CREATE_NEW) {
          continue; // New exercise was created, no need to proceed further
        }
        if (exerciseIndex.status === SELECTION_STATUS.GO_BACK) {
          currentStep = "Workouts"; // User chose to go back to workout selection, restart the loop
          continue;
        }
        if (exerciseIndex.status === SELECTION_STATUS.EXIT) {
          running = false; // User chose to exit, break the loop
          continue;
        }

        if (exerciseIndex.status === SELECTION_STATUS.IMPORTED_EXERCISES) {
          continue; // After importing exercises, prompt the user to select an exercise to set records for
        }

        const exercise = this.workout!.exercises[
          exerciseIndex.value as number
        ] as Exercise;
        this.exercise = exercise;
        currentStep = "Records"; // Move to the next step after selecting an exercise
      } else if (currentStep === "Records") {
        // Need to check here if the exercise already has records, if so ask if they want to overwrite or add new records
        if (this.exercise!.records.length > 0) {
          const recordAction = await select({
            message: `This exercise already has records. What would you like to do?`,
            choices: [
              {
                name: "Overwrite existing records",
                value: SELECTION_STATUS.OVERWRITE,
              },
              { name: "Go back to Exercises", value: SELECTION_STATUS.GO_BACK },
              { name: "Exit", value: SELECTION_STATUS.EXIT },
            ],
          });
          if (recordAction === SELECTION_STATUS.GO_BACK) {
            currentStep = "Exercises"; // User chose to go back to exercise selection, restart the loop
            continue;
          } else if (recordAction === SELECTION_STATUS.EXIT) {
            running = false; // User chose to exit, break the loop
            continue;
          } else if (recordAction === SELECTION_STATUS.OVERWRITE) {
            // If overwriting, we can simply call setRecord which will replace the existing records with the new ones
            await this.setRecord();
            currentStep = "Exercises"; // After setting a record, go back to exercise selection to allow adding more records or selecting a different exercise
          }
        } else {
          await this.setRecord();
          currentStep = "Exercises"; // After setting a record, go back to exercise selection to allow adding more records or selecting a different exercise
        }
      }
    }
    this.logData();
  }

  logData() {
    console.log("Current Data:", JSON.stringify(this.data, null, 2));
  }
}
