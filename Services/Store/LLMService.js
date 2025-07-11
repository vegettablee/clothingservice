import OpenAI from "openai";
const client = new OpenAI({ apiKey: api_key });

gpt_model = "gpt-4.1";

const categorizer_role =
  "Categorize secondhand stores: \
PRIMARY (Thrift Stores | Consignment Shops | Buy/Sell Stores | Designer Resale | Vintage Boutiques - can overlap with +), \
FUNDING (Donation-based | Purchase-based), \
INVENTORY (Vintage | Secondhand Designer | Mall/Trendy Clothes | Everything/Mixed). \
Also provide a brief summary of the store in 1-2 sentences. \
\n\
Format:\n\
Primary: [X] | Funding: [X] | Inventory: [X] | Summary: [Short, 1-2 sentence overview]";

api_key =
  "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";

url = "https://api.openai.com/v1/responses";

const stores_per_batch = 10;

console.log(response.output_text);

const LLMStoreFetch = async (stores) => {
  batch = [];
  for (let counter = 0; counter < stores.length(); counter++) {
    if (counter + 1 == stores.length()) {
      // this is the last iteration of the batch, so just send whatever is left
      batch.append(stores[counter]);
      content = format_store_data(batch);
      callLLM(content);
    } else if (counter != 0 && batch.length() == stores_per_batch) {
      // not the first index, but 10 stores have been reached
      batch.append(stores[counter]);
      content = format_store_data(batch);
      callLLM(content);
      batch = [];
    } else {
      batch.append(stores[counter]);
    }
  }
};
const format_store_data = (store_batch) => {
  // this servers mainly to just get the important data from the raw store information using the mongodb schema
};

const callLLM = async (meta_content) => {
  const response = await openai.responses.create({
    store: false,
    model: "gpt-4.1",
    tools: [
      {
        type: "web_search_preview",
        search_context_size: "medium",
      },
    ],
    input: [
      {
        role: categorizer_role,
        content: meta_content, // fill this with store meta-data, make sure to send max twenty stores at a time
      },
    ],
    background: true,
  });
  let storeInformation = await response.output_text;
};

module.exports = { LLMStoreFetch };
