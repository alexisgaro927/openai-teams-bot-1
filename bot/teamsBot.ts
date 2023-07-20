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



    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");

      let txt = context.activity.text;
   
      const axios = require('axios');
      let data = JSON.stringify({
        "messages": [
          {
            "role": "system",
            "content": "You are an AI assistant that helps people find information."
          },
          {
            "role": "user",
            "content": txt
          }
        ],
        "max_tokens": 800,
        "temperature": 0,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "top_p": 1,
        "stop": null
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://1ws3s3.openai.azure.com/openai/deployments/gpt35qna/chat/completions?api-version=2023-03-15-preview',
        headers: { 
          'Content-Type': 'application/json', 
          'api-key': '34faa5e8993d442d80b5c4d25cae5ee2'
        },
        data : data
      };
      
      let message;

      axios.request(config)
      .then((response) => {
        const message = response.data.choices[0].message.content; // Extract the message from the response
        console.log(message)
        return context.sendActivity(message); // Send the message here, inside the .then() block
  
      })
      .catch((error) => {
        console.log(error);
      });

      

 

     

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
