Purpose:

- At a high level, this backend service is mainly responsible for two main functions:
  1. Checking the client coordinate's that are being sent in the request, if within 0.25 miles return from DB. 
  1. Fetching Nearby Stores -> Check if contained in DB(MongoDB) -> If so -> Return nearby stores from DB
  2. If not -> Send Nearby Stores NOT(from google API) in DB to LLM to parse/curate stores -> Add stores to DB and return nearby stores
  3. It is also responsible for creating a client database, which is used to return data quicker based on the proximity
     of the client, based on whether the coordinates were within a certain range. 

Pre-requisites: Node.js, Express.js, MongoDB, S3
Environment Variables : Google API_KEY, Open_AI Key, AWS S3 Credentials, MongoDB Creds

Entry point is main.js, however, most of the important network calls are within the storeController.js file 