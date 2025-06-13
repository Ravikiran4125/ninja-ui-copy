import OpenAI from "openai";
import { Logger } from "../../src/utils/Logger.js";
import { Shinobi } from "../../src/core/shinobi.js";
import { researchDirectorShinobi } from "../definitions/shinobi/index.js";
import { fileManagerShuriken, webSearchShuriken } from "../definitions/shurikens/index.js";
import { KataRuntime } from "../../src/core/kataRuntime.js";
import { openai } from "../openaiClient.js";

const logger = new Logger('info', 'OrchestrationDemo');

const runtime = new KataRuntime(openai, logger)

const researchDirector = new Shinobi(runtime, {
    ...researchDirectorShinobi,
    shurikens: [webSearchShuriken, fileManagerShuriken]
});

researchDirector.execute("What is the current trend in artificial intelligence and machine learning, focusing on practical business applications and future opportunities.").then((result) => {
    console.log(result);
});