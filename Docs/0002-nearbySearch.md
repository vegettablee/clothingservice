The Google Places API(Text Nearby Search) returns a nextPageToken if there are more than x results in x radius

This is a problem because:

1. Not all places have the same density, places that are more dense will be left out
2. There needs to be a way to limit API calls whilst getting accurate data

My solution:

- I chose a pagination solution, if there exists a nextPageToken(more than 20 stores), then the original search is divided
  four main quadrants, using the center of the four quadrants, four more searches are ran with 70% of the original radius.
- This approach over simply going through each page is better because I can change the queries(for testing)
  and I can cache the original search radius, and limit these calls. Not only that but if one of these quadrants has a nextPageToken,
  then it is possible to deal with this quadrant specifically in the future. While it may result in more API calls if not optimized,
  it provides more flexibility and more accurate data.

After finding all of the stores in the nearby area :

- Remove the repeats and merge stores if needed
- Compare to DB, if there is a new store, send to LLM
