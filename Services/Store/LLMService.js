require("dotenv").config();
const OpenAI = require("openai").default;
const client = new OpenAI({ apiKey: process.env.GPT_API_KEY });
const { zodTextFormat } = require("openai/helpers/zod");
const { z } = require("zod");
// const exampleStore = require("../data_store.js");
const { LLMStoreFormat } = require("../../Models/store.js");
const { addPhotosToS3 } = require("../../ServicesS3/s3UploadService.js");
const { addToDB } = require("./storeService.js");

const gpt_model = "gpt-4.1";

const LLMInstructions = `
You are an expert second-hand clothing store analyst, Please categorize all second-hand clothing stores
in succession according to the following criteria:


• PRIMARY: one of ["Thrift", "Consignment", "Buy/Sell", "Designer Resale", "Vintage Boutique"] (may overlap)
• FUNDING: one of ["Donation-based", "Purchase-based"]
• INVENTORY: one or more of ["Vintage", "Secondhand Designer", "Mall/Trendy Clothes", "Everything/Mixed"]
• SUMMARY: a 1-2 sentence analysis of the store, specifically about what they sell, what they are known for, and what makes them unique.
• ESTIMATED PRICE-RANGE: an approximate price bracket (e.g. "$", "$$", "$$$"), note : ALL major thrift chains such as Goodwill, Savers,
  Value Village, Salvation Army, and America's Thrift Stores, are automatically categorized as "$" `;

// this needs more work/experimentation in regards to what prompts yield the best data, but so far,
// it has been pretty accurate

const stores_per_batch = 10; // number of stores to send per batch to the LLM
const reviews_per_store = 3; // number of reviews to send per store

const LLMStoreFetch = async (stores) => {
  let batch = []; // array of the current stores batch being sent
  let curatedStores = []; // this holds an array of all the LLM information
  let storeSchemas = [];
  let batchSchemas = [];

  for (let counter = 0; counter < stores.length; counter++) {
    if (counter + 1 === stores.length) {
      // this is the last iteration of the batch, so just send whatever is left
      batch.push(stores[counter]);
      content = format_store_data(batch);
      let categorizedStores = await callLLM(content);
      let batchSchemas = addPhotosToS3(categorizedStores, batch);
      storeSchemas.push(batchSchemas);
    } else if (stores_per_batch === batch.length) {
      // if the amount of stores per batch is reached, send the current batch

      content = format_store_data(batch);
      let categorizedStores = await callLLM(content);
      let batchSchemas = addPhotosToS3(categorizedStores, batch);
      storeSchemas.push(batchSchemas);
      batch = []; // reset the batch
      batch.push(stores[counter]); // add the most recent store
    } else {
      batch.push(stores[counter]);
    }
  }
  storeSchemas = storeSchemas.flat(); // flattens all the schemas into a non-nested array
  return storeSchemas;
};

const format_reviews = (reviews, contentPayLoad) => {
  let counter = 0;
  let content = "";
  let reviews_to_send = [];
  for (let review of reviews) {
    if (counter == reviews_per_store) {
      break;
    }
    ++counter;
    reviews_to_send.push(review.originalText.text);
  }

  for (let index = 0; index < reviews_to_send.length; index++) {
    contentPayLoad.Reviews[index].text = reviews_to_send[index];
  }
};

// this servers mainly to just get the important data from the raw store information using the mongodb schema
const format_store_data = (stores) => {
  // data to send:
  // website uri, display name, review summary, reviews

  const required_keys = [
    "websiteUri",
    "displayName.text",
    "reviewSummary.text.text",
  ];

  let content = []; // this is an array of store objects following the JSON format in store.js

  for (const store of stores) {
    let contentPayLoad = LLMStoreFormat(reviews_per_store);

    if (store.displayName?.text !== undefined) {
      contentPayLoad.Name = store.displayName.text;
    }
    if (store.websiteUri !== undefined) {
      contentPayLoad.Website = store.websiteUri;
    }
    if (store.reviewSummary?.text?.text !== undefined) {
      contentPayLoad.ReviewSummary = store.reviewSummary.text.text;
    }
    if (store.reviews !== undefined) {
      format_reviews(store.reviews, contentPayLoad); // adds to the payload in the function
    }
    content.push(contentPayLoad);
  }

  console.log(content);
  return content;
};

const callLLM = async (contents) => {
  const StoreEntry = z.object({
    Primary: z.enum([
      "Thrift",
      "Consignment",
      "Buy/Sell",
      "Designer Resale",
      "Vintage Boutique",
    ]),
    Funding: z.enum(["Donation-based", "Purchase-based"]),
    Inventory: z.enum([
      "Vintage",
      "Secondhand Designer",
      "Mall/Trendy Clothes",
      "Everything/Mixed",
    ]),
    Summary: z.string(),
    "Estimated Price-Range": z.enum(["$", "$$", "$$$", "$$$$"]),
    hasSecondhandClothing: z.boolean(),
  });

  const StoreList = z.object({
    stores: z.array(StoreEntry),
  });

  const response = await client.responses.parse({
    model: gpt_model,
    instructions: LLMInstructions,
    input: [
      { role: "system", content: LLMInstructions },
      { role: "user", content: JSON.stringify(contents) },
    ],
    text: {
      format: zodTextFormat(StoreList, "store_list"),
    },
  });
  let store_list = response.output_parsed;
  console.log(store_list);
  return store_list;
  // store_list is in the form of stores : [
  // { primary, funding, inventory },
  //  ]
};

module.exports = { format_store_data, LLMStoreFetch };
