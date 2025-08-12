Purpose:

- At a high level, this backend service is mainly responsible for two main functions:
  1. Fetching Nearby Stores -> Check if contained in DB(MongoDB) -> If so -> Return nearby stores from DB
  2. If not -> Send Nearby Stores NOT in DB to LLM to parse/curate stores -> Add stores to DB and return nearby stores
  3. It is also responsible for creating a client database, which is used to return data quicker based on the proximity
     of the client.

Pre-requisites: Node.js, Express.js, MongoDB
Environment Variables : Google API_KEY, Open_AI Key, AWS S3 Credentials, MongoDB Creds
