#!/bin/bash

# Firebase Clients Migration Script
# This script applies the Firebase UID migration to the Supabase database

echo "Applying Firebase clients migration..."

# Check if SUPABASE_SERVICE_ROLE_KEY is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    echo "Please set it with: export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    exit 1
fi

# Run the migration SQL
curl -X POST 'https://fvrueabzpinhlzyrnhne.supabase.co/rest/v1/rpc/exec_sql' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3ODE4MiwiZXhwIjoyMDc2NTU0MTgyfQ.WItOFfQ_E97EpfBeYl99GNS0ZOkDpkUWijuSitdl6UE' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cnVlYWJ6cGluaGx6eXJuaG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3ODE4MiwiZXhwIjoyMDc2NTU0MTgyfQ.WItOFfQ_E97EpfBeYl99GNS0ZOkDpkUWijuSitdl6UE' \
  -H 'Content-Type: application/json' \
  -d @- << EOF
{
  "sql": "$(cat firebase-clients-migration.sql | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/  */ /g')"
}
EOF

echo "Migration completed. Please check your Supabase dashboard to verify the changes."