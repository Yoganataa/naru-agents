#!/bin/bash
# ─── install.sh ── Bash installer for naru-agents ────────────────────────────
# Clones the repo and runs the installer
# Usage: curl -fsSL https://raw.githubusercontent.com/yoganataa/naru-agents/main/install.sh | bash
# ──────────────────────────────────────────────────────────────────────────────

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO="https://github.com/yoganataa/naru-agents.git"
INSTALL_DIR="$HOME/.config/opencode"
TEMP_DIR=$(mktemp -d)

# Print with color
print_info() {
  echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

print_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup on exit
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Check dependencies
check_deps() {
  if ! command -v git &> /dev/null; then
    print_error "git is required but not installed."
    exit 1
  fi

  if ! command -v bun &> /dev/null; then
    if ! command -v node &> /dev/null; then
      print_error "bun or node is required but not installed."
      exit 1
    fi
    print_warn "bun not found, using node"
    RUNNER="node"
  else
    RUNNER="bun"
  fi
}

# Clone repository
clone_repo() {
  print_info "Cloning naru-agents..."
  git clone --depth 1 "$REPO" "$TEMP_DIR"
}

# Install agents
install_agents() {
  print_info "Installing agents to $INSTALL_DIR..."

  # Create directories
  mkdir -p "$INSTALL_DIR/agents"
  mkdir -p "$INSTALL_DIR/knowledge"

  # Copy agent files
  for file in "$TEMP_DIR/agents/"*.md; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      cp "$file" "$INSTALL_DIR/agents/"
      print_success "Installed $filename"
    fi
  done

  # Copy knowledge files
  for file in "$TEMP_DIR/knowledge/"*.md; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      cp "$file" "$INSTALL_DIR/knowledge/"
      print_success "Installed $filename"
    fi
  done
}

# Main
main() {
  echo ""
  echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║          @yoganataa/naru-agents installer                    ║${NC}"
  echo -e "${CYAN}║          AI Team Lead orchestration for opencode             ║${NC}"
  echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  check_deps
  clone_repo
  install_agents

  echo ""
  print_success "Installation complete!"
  echo ""
  print_info "Restart opencode to use the agents."
  echo ""
}

main "$@"
