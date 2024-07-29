#!/usr/bin/env sh

PROJECT_TYPE="library"
PROJECT_NAME=$(sed -n "s/.*\"name\": \"\(.*\)\",/\1/p" package.json)
PROJECT_VERSION=$(sed -n "s/.*\"version\": \"\(.*\)\",/\1/p" package.json)

echo "Creating SBOM (type: $PROJECT_TYPE) for $PROJECT_NAME $PROJECT_VERSION..."

yarn dlx -q @cyclonedx/yarn-plugin-cyclonedx --prod --mc-type $PROJECT_TYPE --output-file sbom.json

curl -X POST "https://dependencytrack.mt.trumpf.com/backend/api/v1/bom" \
    -H "Content-Type: multipart/form-data" \
    -H "X-Api-Key: $DEPENDENCY_TRACK_API_KEY" \
    -F "autoCreate=true" \
    -F "parentName=scalenc" \
    -F "projectName=scalenc-$PROJECT_NAME" \
    -F "projectVersion=$PROJECT_VERSION" \
    -F "bom=@sbom.json" \
    -s
