Write-Host "🚀 Packaging Arthora Android Release Artifacts..." -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MobileDir = Split-Path -Parent $ScriptDir
$RepoDir = Split-Path -Parent $MobileDir
$DistDir = Join-Path $RepoDir "dist\mobile"

if (!(Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

Set-Location $MobileDir

Write-Host "📦 Fetching Flutter dependencies..." -ForegroundColor Yellow
flutter pub get

Write-Host "🔨 Building Universal Release APK..." -ForegroundColor Yellow
flutter build apk --release --dart-define=API_BASE_URL="https://arthora-api.onrender.com/api/v1"

Write-Host "🔨 Building Split ABI APKs..." -ForegroundColor Yellow
flutter build apk --release --split-per-abi --dart-define=API_BASE_URL="https://arthora-api.onrender.com/api/v1"

$UniversalApk = Join-Path $MobileDir "build\app\outputs\flutter-apk\app-release.apk"
if (Test-Path $UniversalApk) {
    Copy-Item $UniversalApk -Destination (Join-Path $DistDir "arthora-universal-release.apk") -Force
    Write-Host "✅ Copied Universal APK to $DistDir\arthora-universal-release.apk" -ForegroundColor Green
}

Get-ChildItem "$MobileDir\build\app\outputs\flutter-apk\app-*-release.apk" | ForEach-Object {
    $targetName = "arthora-" + $_.Name
    Copy-Item $_.FullName -Destination (Join-Path $DistDir $targetName) -Force
}

Write-Host "✨ Android packaging complete. Artifacts stored in $DistDir" -ForegroundColor Green
