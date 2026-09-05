#!/usr/bin/env bash
set -e

echo "🚀 Packaging Arthora Android Release Artifacts..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
REPO_DIR="$(dirname "$MOBILE_DIR")"
DIST_DIR="$REPO_DIR/dist/mobile"

mkdir -p "$DIST_DIR"

cd "$MOBILE_DIR"

echo "📦 Fetching Flutter dependencies..."
flutter pub get

echo "🔨 Building Universal Release APK..."
flutter build apk --release \
  --dart-define=API_BASE_URL="https://arthora-api.onrender.com/api/v1"

echo "🔨 Building Split ABI APKs (arm64-v8a, armeabi-v7a, x86_64)..."
flutter build apk --release --split-per-abi \
  --dart-define=API_BASE_URL="https://arthora-api.onrender.com/api/v1"

# Copy output binaries to dist/mobile
if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
  cp "build/app/outputs/flutter-apk/app-release.apk" "$DIST_DIR/arthora-universal-release.apk"
  echo "✅ Copied Universal APK to $DIST_DIR/arthora-universal-release.apk"
fi

for apk in build/app/outputs/flutter-apk/app-*-release.apk; do
  if [ -f "$apk" ]; then
    filename=$(basename "$apk")
    cp "$apk" "$DIST_DIR/arthora-${filename}"
  fi
done

echo "📋 Generating SHA-256 checksums..."
cd "$DIST_DIR"
sha256sum arthora-*.apk > SHA256SUMS.txt || true

echo "✨ Android packaging complete. Artifacts available in dist/mobile/"
