Purpose:

- At a high level, this backend service is mainly responsible for two main functions:
  1. Fetching Nearby Stores -> Check if contained in DB(MongoDB) -> If so -> Return nearby stores from DB
  2. If not -> Send Nearby Stores NOT in DB to LLM to parse/curate stores -> Add stores to DB and return nearby stores

Pre-requisites: Node.js, Expres.js, MongoDB
Environment Variables : Google API, S3
Main endpoints:
