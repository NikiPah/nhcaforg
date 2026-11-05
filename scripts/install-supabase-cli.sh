#!/usr/bin/env bash
set -euo pipefail
version=2.75.0
destination="${SUPABASE_CLI_INSTALL_DIR:-/workspace/tools/supabase-2.75.0}"
if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
  echo 'This helper supports Linux x86_64. Use an official Supabase CLI distribution for your platform.' >&2
  exit 1
fi
temporary_dir="$(mktemp -d)"
trap 'rm -rf "$temporary_dir"' EXIT
release="https://github.com/supabase/cli/releases/download/v${version}"
curl --fail --location --silent --show-error --retry 2 "$release/supabase_${version}_checksums.txt" -o "$temporary_dir/checksums.txt"
curl --fail --location --silent --show-error --retry 2 "$release/supabase_linux_amd64.tar.gz" -o "$temporary_dir/supabase_linux_amd64.tar.gz"
(
  cd "$temporary_dir"
  awk '$2 == "supabase_linux_amd64.tar.gz" {print}' checksums.txt > selected-checksum.txt
  test -s selected-checksum.txt
  sha256sum --check selected-checksum.txt
  tar -xzf supabase_linux_amd64.tar.gz supabase
)
mkdir -p "$destination"
install -m 0755 "$temporary_dir/supabase" "$destination/supabase"
"$destination/supabase" --version
