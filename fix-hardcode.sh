#!/bin/bash

# Files cần fix
FILES=(
  "apps/frontend/src/app/products/page.tsx"
  "apps/frontend/src/app/products/create/page.tsx"
  "apps/frontend/src/app/products/[id]/page.tsx"
  "apps/frontend/src/app/products/[id]/edit/page.tsx"
  "apps/frontend/src/app/donations/page.tsx"
  "apps/frontend/src/app/donations/[id]/page.tsx"
  "apps/frontend/src/app/donations/category/[category]/page.tsx"
  "apps/frontend/src/app/donations/create/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace hardcoded URLs with API_URL
    sed -i 's|"http://localhost:3001/api/v1|`${API_URL}|g' "$file"
    sed -i 's|`http://localhost:3001/api/v1|`${API_URL}|g' "$file"
    # Add import if not exists
    if ! grep -q "import.*API_URL.*from.*lib/constants" "$file"; then
      sed -i '1i import { API_URL } from "@/lib/constants";' "$file"
    fi
  fi
done

echo "Done!"
