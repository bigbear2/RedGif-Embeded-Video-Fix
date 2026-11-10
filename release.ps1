[CmdletBinding()]
param(
    [string]$Version,
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$repository = 'bigbear2/RedGif-Embeded-Video-Fix'
$branch = 'main'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$oldScripts = @(
    'redgif-embed-video-fix.user.js',
    'redgif-embed-video-fix-settings.user.js'
)
$releaseFiles = @(
    'README.md',
    'redgif-embed-video-fix-lite.user.js',
    'redgif-embed-video-fix-ui.user.js'
)

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $output = & $Command @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "$Command $($Arguments -join ' ') failed:`n$($output | Out-String)"
    }

    return ($output | Out-String).Trim()
}

Push-Location $root
try {
    $gitRoot = Invoke-CheckedCommand 'git' @('rev-parse', '--show-toplevel')
    if ([System.IO.Path]::GetFullPath($gitRoot) -ne [System.IO.Path]::GetFullPath($root)) {
        throw "The script must run from the repository root: $root"
    }

    $currentBranch = Invoke-CheckedCommand 'git' @('branch', '--show-current')
    if ($currentBranch -ne $branch) {
        throw "Release from '$branch', not '$currentBranch'."
    }

    $scriptVersions = foreach ($file in $releaseFiles | Where-Object { $_ -like '*.user.js' }) {
        $header = Get-Content -LiteralPath $file -Raw
        if ($header -notmatch '(?m)^// @version\s+(\d+\.\d+(?:\.\d+)?)\s*$') {
            throw "Could not read a valid @version from $file"
        }
        $Matches[1]
    }

    if (($scriptVersions | Select-Object -Unique).Count -ne 1) {
        throw "Userscript versions do not match: $($scriptVersions -join ', ')"
    }

    $scriptVersion = $scriptVersions[0]
    if ($Version) {
        $Version = $Version.TrimStart('v')
        if ($Version -ne $scriptVersion) {
            throw "Requested version $Version does not match userscript version $scriptVersion."
        }
    } else {
        $Version = $scriptVersion
    }

    $tag = "v$Version"
    $null = Invoke-CheckedCommand 'gh' @('auth', 'status')

    $existingTag = Invoke-CheckedCommand 'git' @('tag', '--list', $tag)
    if ($existingTag) {
        throw "Tag $tag already exists locally."
    }

    $remoteTag = Invoke-CheckedCommand 'git' @('ls-remote', '--tags', 'origin', "refs/tags/$tag")
    if ($remoteTag) {
        throw "Tag $tag already exists on origin."
    }

    $allowedPaths = @(
        'README.md',
        'release.ps1',
        'redgif-embed-video-fix.user.js',
        'redgif-embed-video-fix-settings.user.js',
        'redgif-embed-video-fix-lite.user.js',
        'redgif-embed-video-fix-ui.user.js'
    )
    $status = & git status --porcelain=v1 --untracked-files=all
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not inspect the worktree status.'
    }
    $changedPaths = @()
    foreach ($line in ($status -split "`r?`n" | Where-Object { $_ })) {
        $path = $line.Substring(3)
        if ($path -match ' -> ') {
            $path = ($path -split ' -> ')[-1]
        }
        if ($path -notin $allowedPaths) {
            throw "Refusing to release with unrelated worktree change: $path"
        }
        $changedPaths += $path
    }

    if ($WhatIf) {
        Write-Output "Validated release $tag for $repository."
        Write-Output "Would stage: $($releaseFiles -join ', '), release.ps1, and tracked legacy script removals."
        Write-Output "Would commit, push $branch, and create the GitHub release with the README and both userscripts."
        return
    }

    if (-not $changedPaths.Count) {
        throw 'There are no release changes to commit.'
    }

    $stagePaths = @('README.md', 'release.ps1') + $releaseFiles | Select-Object -Unique
    foreach ($oldScript in $oldScripts) {
        $null = & git ls-files --error-unmatch $oldScript 2>$null
        if ($LASTEXITCODE -eq 0) {
            $stagePaths += $oldScript
        }
    }

    $null = Invoke-CheckedCommand 'git' (@('add', '-A', '--') + $stagePaths)
    $stagedChanges = Invoke-CheckedCommand 'git' @('diff', '--cached', '--name-only')
    if (-not $stagedChanges) {
        throw 'No release files were staged.'
    }

    $null = Invoke-CheckedCommand 'git' @(
        'commit',
        '-m', "Release userscript $tag",
        '-m', 'Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>'
    )
    $null = Invoke-CheckedCommand 'git' @('push', 'origin', $branch)

    $notes = @'
## Two userscript versions

- **Lite:** configure playback options and skip duration in the script constants.
- **UI:** configure looping, pause/resume behavior, keyboard seeking, and skip duration in the settings dialog.

Autoplay is always blocked in both versions. The overlay now lets native clicks reach the embed controls.

Install only one version at a time. Release assets include both userscripts and the README.
'@

    $releaseArguments = @(
        'release', 'create', $tag,
        'redgif-embed-video-fix-lite.user.js',
        'redgif-embed-video-fix-ui.user.js',
        'README.md',
        '--repo', $repository,
        '--target', $branch,
        '--title', "RedGif Embedded Video Fix $tag",
        '--notes', $notes
    )
    $releaseUrl = Invoke-CheckedCommand 'gh' $releaseArguments
    Write-Output $releaseUrl
    Invoke-CheckedCommand 'gh' @('release', 'view', $tag, '--repo', $repository, '--json', 'name,tagName,url,assets')
} finally {
    Pop-Location
}
