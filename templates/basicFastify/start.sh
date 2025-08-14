#!/bin/bash

# Color codes for output messages
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting development environment...${NC}"

if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    # Configure git to ignore file permission changes
    echo -e "${GREEN}Configuring git to ignore permission changes...${NC}"
    git config core.fileMode false

    # Get current branch name
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${GREEN}Current branch: ${CURRENT_BRANCH}${NC}"

    # Pull latest changes
    echo -e "${GREEN}Pulling latest changes from ${CURRENT_BRANCH}...${NC}"
    if ! git pull origin "$CURRENT_BRANCH"; then
        echo -e "${RED}Failed to pull latest changes.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No Git repository detected. Skipping Git operations.${NC}"
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
if ! npm install; then
    echo -e "${RED}Failed to install dependencies.${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then

    echo -e "${RED}Critical: .env file not found in $(pwd). Please create it before running this script, please check ./env.example to see the format. (DW it happens even to the best of us XD)${NC}"
    exit 1
fi

# Run prisma generate
echo -e "${GREEN}Generating Prisma client...${NC}"
# Change to prisma directory
cd app/prisma || {
    echo -e "${RED}Failed to change to prisma directory.${NC}"
    exit 1
}
# First pull the database schema
echo -e "${GREEN}Pulling database schema...${NC}"
if ! npx prisma db pull; then
    echo -e "${RED}Failed to pull database schema.${NC}"
    exit 1
fi
# Then generate the Prisma client
if ! npx prisma generate; then
    echo -e "${RED}Failed to generate Prisma client.${NC}"
    exit 1
fi
# Return to original directory
cd - > /dev/null

# Start development server
echo -e "${GREEN}Starting development server...${NC}"
npm run dev