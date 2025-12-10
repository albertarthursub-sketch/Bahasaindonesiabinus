#!/bin/bash
# Google Cloud Secret Manager Setup Script
# This script automates the setup of email credentials in Secret Manager
# Usage: bash setup-secret-manager.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Google Cloud Secret Manager Setup ===${NC}\n"

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
command -v gcloud &> /dev/null || { echo -e "${RED}❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install${NC}"; exit 1; }
echo -e "${GREEN}✅ gcloud CLI found${NC}"

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ No GCP project configured${NC}"
  echo "Set project with: gcloud config set project PROJECT_ID"
  exit 1
fi
echo -e "${GREEN}✅ Project: $PROJECT_ID${NC}\n"

# Enable Secret Manager API
echo -e "${BLUE}Step 1: Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com
echo -e "${GREEN}✅ Secret Manager API enabled${NC}\n"

# Prompt for email credentials
echo -e "${BLUE}Step 2: Enter email credentials${NC}"
read -p "Email username (e.g., arthurapp05@gmail.com): " EMAIL_USER
read -sp "Email password or app-specific password: " EMAIL_PASS
echo ""
echo -e "${GREEN}✅ Credentials entered${NC}\n"

# Create secrets
echo -e "${BLUE}Step 3: Creating secrets in Secret Manager...${NC}"

echo -n "Creating TEACHER_EMAIL_USER secret... "
echo -n "$EMAIL_USER" | gcloud secrets create TEACHER_EMAIL_USER \
  --data-file=- \
  --replication-policy="automatic" \
  --quiet 2>/dev/null || \
gcloud secrets versions add TEACHER_EMAIL_USER --data-file=- <<< "$EMAIL_USER"
echo -e "${GREEN}✅${NC}"

echo -n "Creating TEACHER_EMAIL_PASSWORD secret... "
echo -n "$EMAIL_PASS" | gcloud secrets create TEACHER_EMAIL_PASSWORD \
  --data-file=- \
  --replication-policy="automatic" \
  --quiet 2>/dev/null || \
gcloud secrets versions add TEACHER_EMAIL_PASSWORD --data-file=- <<< "$EMAIL_PASS"
echo -e "${GREEN}✅${NC}\n"

# Get Cloud Functions service account
echo -e "${BLUE}Step 4: Configuring access permissions...${NC}"
FUNCTIONS_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
echo "Service account: $FUNCTIONS_SA"

echo -n "Granting Secret Accessor role for TEACHER_EMAIL_USER... "
gcloud secrets add-iam-policy-binding TEACHER_EMAIL_USER \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet > /dev/null
echo -e "${GREEN}✅${NC}"

echo -n "Granting Secret Accessor role for TEACHER_EMAIL_PASSWORD... "
gcloud secrets add-iam-policy-binding TEACHER_EMAIL_PASSWORD \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet > /dev/null
echo -e "${GREEN}✅${NC}\n"

# Verify setup
echo -e "${BLUE}Step 5: Verifying setup...${NC}"
echo "Secrets created:"
gcloud secrets list --filter="name:(TEACHER_EMAIL_USER OR TEACHER_EMAIL_PASSWORD)" --format="table(name)"

echo -e "\n${GREEN}✅ Secret Manager setup complete!${NC}"

echo -e "\n${YELLOW}📋 Next steps:${NC}"
echo "1. Deploy Cloud Functions:"
echo "   cd functions && npm install && npm run build"
echo "   firebase deploy --only functions"
echo ""
echo "2. Monitor logs:"
echo "   firebase functions:log"
echo ""
echo "3. Test OTP sending:"
echo "   curl -X POST http://localhost:5000/sendOTP \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\"}'"
echo ""
echo -e "${YELLOW}ℹ️  For detailed documentation, see: SECRET_MANAGER_SETUP.md${NC}"
