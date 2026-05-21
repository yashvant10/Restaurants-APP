# Auto-Sync Watcher Script
# This script monitors the project directory for any file saves/updates
# and automatically commits and pushes them to GitHub.

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Define the file types to watch (avoid watching logs, node_modules, or database changes)
$excludePatterns = @("node_modules", "\.git", "\.db", "\.log", "inspect_db\.py")

# Rate limit syncs to avoid overloading
$lastSync = [System.DateTime]::MinValue
$syncDelay = [System.TimeSpan]::FromSeconds(3)

$action = {
    $name = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Filter out excluded directories/files
    foreach ($pattern in $excludePatterns) {
        if ($name -match $pattern) { return }
    }
    
    $now = [System.DateTime]::Now
    if ($now -sub $lastSync -lt $syncDelay) {
        return
    }
    $global:lastSync = $now

    Write-Host ""
    Write-Host "⚡ Change detected: $name ($changeType)" -ForegroundColor Yellow
    Write-Host "🔄 Syncing latest code to GitHub automatically..." -ForegroundColor Cyan
    
    # Run git commands
    git add .
    git commit -m "auto update"
    git push origin main
    
    Write-Host "✅ GitHub sync complete!" -ForegroundColor Green
}

# Bind events
$handlers = @()
$handlers += Register-ObjectEvent $watcher "Changed" -Action $action
$handlers += Register-ObjectEvent $watcher "Created" -Action $action
$handlers += Register-ObjectEvent $watcher "Deleted" -Action $action

Write-Host "🚀 File watcher is active. Watching for changes in: $PSScriptRoot" -ForegroundColor Green
Write-Host "Saving any file will automatically commit and push to GitHub." -ForegroundColor Green
Write-Host "Press Ctrl+C in this terminal window to stop watching." -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    # Clean up handlers on exit
    foreach ($handler in $handlers) {
        Unregister-Event -SourceIdentifier $handler.Name
    }
    $watcher.Dispose()
}
