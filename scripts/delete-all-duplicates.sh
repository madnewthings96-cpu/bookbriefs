#!/bin/bash

# Script to delete duplicate books from Firestore

DUPLICATES=(
    "howtodaytradeforaliving"
    "marketwizards"
    "influence"
    "secretsofthemillionairemind"
    "the48lawsofpower"
    "the33strategiesofwar"
)

echo "🗑️  Deleting ${#DUPLICATES[@]} duplicate books..."
echo ""
echo "Note: You will be prompted for email/password for each book deletion."
echo ""

for book_id in "${DUPLICATES[@]}"; do
    echo "Deleting: $book_id"
    npx tsx scripts/delete-book.ts "$book_id"
    echo ""
done

echo "✅ All duplicates deleted!"
