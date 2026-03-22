# Quote of the Day API

## Project Overview
A simple REST API that serves inspirational quotes. Built with Node.js and Express.

## File Structure
```
.
├── CLAUDE.md
├── package.json
├── server.js          # Express app and route definitions
├── data/
│   └── quotes.json    # Quote data store
└── tests/
    └── routes.test.js # Jest tests for all routes
```

## Routes
- `GET /quote/random` — Returns a single random quote
- `GET /quotes` — Returns all quotes
- `GET /quote/:id` — Returns a specific quote by ID (1-based)

## Running the Server
```bash
npm start        # Start on port 3000
npm test         # Run Jest tests
```

## Data Format
Each quote object:
```json
{
  "id": 1,
  "text": "Quote text here.",
  "author": "Author Name"
}
```
