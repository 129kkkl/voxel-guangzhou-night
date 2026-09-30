$ErrorActionPreference = 'Stop'
$project = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$archivePath = [IO.Path]::GetFullPath((Join-Path $project '体素广州_新中轴_源码工程.zip'))
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$files = @()
$files += Get-ChildItem -LiteralPath (Join-Path $project 'src') -Recurse -File
foreach ($relative in @(
  'README.md','package.json','package-lock.json',
  'tools\build.mjs','tools\validate.mjs','tools\browser-test.mjs',
  'tools\geocode.ps1','tools\geocoded.json','tools\package.ps1',
  'browser-night.png','browser-axis.png','browser-day.png','browser-mobile.png'
)) {
  $files += Get-Item -LiteralPath (Join-Path $project $relative)
}
$zip = [IO.Compression.ZipFile]::Open($archivePath, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $relativePath = [IO.Path]::GetRelativePath($project, $file.FullName).Replace('\','/')
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName,
      "voxel-guangzhou/$relativePath", [IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $zip.Dispose() }
$read = [IO.Compression.ZipFile]::OpenRead($archivePath)
try { $entries = $read.Entries.Count } finally { $read.Dispose() }
Write-Output "ZIP_OK $archivePath entries=$entries bytes=$((Get-Item -LiteralPath $archivePath).Length)"
