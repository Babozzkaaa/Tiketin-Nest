#!/bin/sh

echo "Running entrypoint.sh"

echo "DATABASE_URL=$DATABASE_URL"

echo "Running migrations..."
pnpm db:migrate

echo "Starting the application..."
exec node dist/main.js
