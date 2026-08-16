#!/bin/bash
set -e
echo "Loading database dump..."
TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') as exists" 2>/dev/null || echo "false")
if [ "$TABLE_EXISTS" = "t" ]; then
 echo "Dropping existing tables..."
 psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS \"Notification\" CASCADE;"
 psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS \"Monitor\" CASCADE;"
 psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS \"User\" CASCADE;"
fi
echo "Loading dump into database..."
tail -c +4 database/dump.sql | psql "$DATABASE_URL"
echo "Database loaded successfully"