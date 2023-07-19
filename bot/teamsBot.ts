import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  AdaptiveCardInvokeValue,
  AdaptiveCardInvokeResponse,
} from "botbuilder";
import rawWelcomeCard from "./adaptiveCards/welcome.json";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { Configuration, OpenAIApi } from "openai";
import config from "./config";

export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();


    const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");


    const client = new OpenAIClient(
      "https://graphgptdev.openai.azure.com/", 
      new AzureKeyCredential("ace339cc69c14d8eadd5410d4e485f72")
    );


    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");

      let txt = context.activity.text;
   

     const { choices } = await client.getCompletions(
  "text-davinci-003", // assumes a matching model deployment or model name
  [txt])



  for (const choice of choices) {
    console.log(choices.choice.text);
  }

      await context.sendActivity(choices.Text);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          const card = AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
      }
      await next();
    });
  }
}
