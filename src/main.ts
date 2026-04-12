import data from "./consts/data.json";
import { input, select } from "@inquirer/prompts";
import { Logger } from "./logger";
import { LOGGABLE_DATA } from "./consts/types";
import * as fs from "fs";

const logger = new Logger(data);

const ask = async () => {
  // const answer = await select({
  //   message: "What would you like to log?",
  //   choices: LOGGABLE_DATA.map((item) => ({ name: item, value: item })),
  // });

  // await logger.handleUserInput(answer);
  await logger.handleUserInput();

  // Save the updated data back to the JSON file
  fs.writeFileSync(
    "./src/consts/data.json",
    JSON.stringify(logger.data, null, 2),
  );
};

ask();
