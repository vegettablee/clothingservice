The Google Places API(Nearby Search) at MOST returns 20 stores given a radius:

This is a problem because:

1. If there are more than twenty stores, then the true number of stores may not be accurate
2. This would result in excessive API calls each time with no limiting

My solution:

- I chose x radius, rank the stores by the distance(only returns the closest), and check if the number of stores is 20 or less
- This accounts for places that are dense and sparse

If the store is less than 20:

- Continue like normal, compare to DB, if there is a new store, send to LLM

If the store is equal to 20:

- We do 4 other nearby calls, using the edge of the top, bottom, left, and right, and returning
  specifically the closest store to the radius
- With these 4 other nearby calls, remove the repeats and merge them
- These are monitored to prevent excessive API calls
- Compare to DB, if there is a new store, send to LLM
