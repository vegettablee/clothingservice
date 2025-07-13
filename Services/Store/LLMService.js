require("dotenv").config();
const OpenAI = require("openai").default;
const client = new OpenAI({ apiKey: process.env.GPT_API_KEY });
// const exampleStore = require("../data_store.js");
const { LLMStoreFormat } = require("../../Models/store.js");

const gpt_model = "gpt-4.1";

const categorizer_role =
  "Categorize secondhand stores: \
PRIMARY (Thrift Stores | Consignment Shops | Buy/Sell Stores | Designer Resale | Vintage Boutiques - can overlap with +), \
FUNDING (Donation-based | Purchase-based), \
INVENTORY (Vintage | Secondhand Designer | Mall/Trendy Clothes | Everything/Mixed). \
Also provide a brief summary of the store in 1-2 sentences. \
\n\
Format:\n\
Primary: [X] | Funding: [X] | Inventory: [X] | Summary: [Short, 1-2 sentence overview]"; // change the return format to JSON

const stores_per_batch = 10;
const reviews_per_store = 3;

const LLMStoreFetch = async (stores) => {
  batch = [];
  for (let counter = 0; counter < stores.length(); counter++) {
    if (counter + 1 == stores.length()) {
      // this is the last iteration of the batch, so just send whatever is left
      batch.append(stores[counter]);
      content = format_store_data(batch);
      // callLLM(content);
    } else if (counter != 0 && batch.length() == stores_per_batch) {
      // not the first index, but 10 stores have been reached
      batch.append(stores[counter]);
      content = format_store_data(batch);
      // callLLM(content);
      batch = [];
    } else {
      batch.append(stores[counter]);
    }
  }
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

  for (index in reviews_to_send) {
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

  for (let store in stores) {
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

  return content;
  console.log(contentPayLoad);
};

const callLLM = async (stores) => {
  const response = await openai.responses.create({
    store: false,
    model: gpt_model,
    tools: [
      {
        type: "web_search_preview",
        search_context_size: "medium",
      },
    ],
    input: [
      {
        role: categorizer_role,
        content: stores, // batch of 10 stores with their information in json format
      },
    ],
    background: true,
  });
  let storeInformation = await response.output_text;
  // storeInformation is going to be an array of json objects, parse this, format, add it to the database as the next step
};

module.exports = { format_store_data };
