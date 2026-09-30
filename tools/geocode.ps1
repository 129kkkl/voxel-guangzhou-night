$queries = @('Canton Tower Guangzhou','Haixinsha Guangzhou','Guangzhou Opera House','Guangdong Museum Guangzhou','Guangzhou Library','Guangzhou International Finance Center','Guangzhou CTF Finance Centre','Xinghai Concert Hall','Haixin Bridge Guangzhou','Liede Bridge Guangzhou','Guangzhou Bridge Guangzhou')
$results = @()
foreach ($q in $queries) {
  try {
    $uri = 'https://nominatim.openstreetmap.org/search?q=' + [uri]::EscapeDataString($q) + '&format=json&limit=1'
    $a = Invoke-RestMethod -Uri $uri -Headers @{'User-Agent'='VoxelGuangzhouStudy/1.0 (local art project)'} -TimeoutSec 20
    if ($a.Count -gt 0) { $results += [pscustomobject]@{query=$q; lat=$a[0].lat; lon=$a[0].lon; name=$a[0].display_name} }
  } catch { Write-Warning "$q : $_" }
  Start-Sleep -Milliseconds 1100
}
$results | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'geocoded.json') -Encoding utf8
$results | Format-Table query,lat,lon -AutoSize
