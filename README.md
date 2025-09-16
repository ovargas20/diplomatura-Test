# Diplotesting Node

A minimal Node.js project with TypeScript that implements CRUD operations for users using SQLite.

## Features

- TypeScript-based Express.js application
- SQLite database using better-sqlite3
- CRUD API for managing users
- Automatic database initialization

## Installation

```bash
# Install dependencies
pnpm install
```

## Running the Application

```bash
# Development mode
pnpm dev

# Build for production
pnpm build

# Run in production mode
pnpm start
```

## API Endpoints

All endpoints are available at `http://localhost:3000`

- `GET /users` - List all users
- `GET /users/:id` - Get a specific user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update an existing user
- `DELETE /users/:id` - Delete a user

## Database

The application uses SQLite with a database file located at `/db/diplotesting.db`. The database and tables are created automatically when the application starts.
