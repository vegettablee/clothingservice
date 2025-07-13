const returnStoreFormat = (data) => {
  return {
    places: data.places ?? null,
    nextPageToken: data.nextPageToken ?? null,
  };
};

const returnNullStore = () => {
  return {
    places: null,
    nextPageToken: null,
  };
};

const LLMStoreFormat = (num_of_reviews) => {
  return {
    Name: "N/A",
    Website: "N/A",
    ReviewSummary: "N/A",
    Reviews: Array.from({ length: num_of_reviews }, () => ({
      text: "N/A",
    })),
  };
};

module.exports = { returnStoreFormat, returnNullStore, LLMStoreFormat };
