#!/bin/bash
# Usage: ./update-data.sh
#
# This script exports the Google Sheet as CSV and converts it to the data.json format.
# For now it downloads the "test" tab (gid=17627963) as CSV.
#
# Requirements: curl, python3
#
# The spreadsheet must be publicly accessible (or "anyone with the link" sharing).

SHEET_ID="1Et1o0dEH4wOaQP77OLCWHUhGTn2uZhVE4IGZRuW0y18"
GID="17627963"
OUTPUT="data-raw.csv"

echo "Downloading spreadsheet tab (gid=$GID)..."
curl -sL "https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}" -o "$OUTPUT"

if [ -s "$OUTPUT" ]; then
  echo "Saved to $OUTPUT ($(wc -l < "$OUTPUT") lines)"
  echo ""
  echo "Contents:"
  cat "$OUTPUT"
  echo ""
  echo "---"
  echo "To update data.json, edit it manually or ask Claude to merge this CSV into data.json."
else
  echo "Error: Download failed or file is empty."
  echo "Make sure the spreadsheet is shared as 'Anyone with the link'."
fi
