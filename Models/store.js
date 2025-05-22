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

module.exports = { returnStoreFormat, returnNullStore };
