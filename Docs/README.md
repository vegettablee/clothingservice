## Overview
A Node.js/Express backend service that automatically discovers and enriches thrift store listings using intelligent location-based queries and AI-powered data curation.
## Core Functionality
The service handles two main operations:

Proximity-Based Retrieval: Checks incoming client coordinates and returns cached results if within 0.25 miles
Intelligent Store Discovery Pipeline:

Fetch nearby stores from Google Places API
Check MongoDB for existing store data
If new stores found → Send to GPT-4 for parsing/curation → Add to database
Return enriched store listings to client

## Architecture
Client Request → Coordinate Validation → Database Check → Google Places API → GPT-4 Enrichment → MongoDB Storage → Response
The system implements client proximity detection to prevent redundant operations and database bloat, while automatically enriching store listings with structured metadata (category, funding model, inventory type).
Key Features

Geospatial Indexing: MongoDB with efficient location-based queries
AI-Powered Curation: GPT-4 integration for automated store data enrichment
AWS S3 Integration: Image storage with automated upload/retrieval and database caching
Smart Proximity Detection: 0.25-mile radius client caching system
Automated Deduplication: Prevents redundant database entries

Tech Stack
Node.js, Express.js, MongoDB, AWS S3, Google Places API, OpenAI GPT-4

## Setup
npm install
node main.js

main.js - Entry point and server configuration
storeController.js - Core business logic and API integrations
