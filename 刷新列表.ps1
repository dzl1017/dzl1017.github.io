# ==========================================================
#  刷新作品列表
#  作用：扫描 projects 下的文件夹，读取 info.json，
#        压缩过大的图片，生成 assets/projects.js。
#  用法：双击本文件。增删项目或图片后都要跑一次。
# ==========================================================

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$projDir = Join-Path $root 'projects'
$outFile = Join-Path $root 'assets\projects.js'
$imgExts = @('.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp')

# 网页图片上限，超过就缩小
$maxW = 1600
$maxH = 2200
$maxBytes = 700KB

Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param([string]$Src, [string]$Dest)
    $img = [System.Drawing.Image]::FromFile($Src)
    try {
        $scale = [Math]::Min($maxW / $img.Width, $maxH / $img.Height)
        if ($scale -gt 1) { $scale = 1 }
        $newW = [int][Math]::Round($img.Width * $scale); if ($newW -lt 1) { $newW = 1 }
        $newH = [int][Math]::Round($img.Height * $scale); if ($newH -lt 1) { $newH = 1 }

        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $newW, $newH)
        $g.Dispose()

        $ext = [System.IO.Path]::GetExtension($Dest).ToLower()
        if ($ext -eq '.jpg' -or $ext -eq '.jpeg') {
            $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
                     Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
            $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                [System.Drawing.Imaging.Encoder]::Quality, [long]84)
            $bmp.Save($Dest, $codec, $ep)
            $ep.Dispose()
        }
        else {
            $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        $bmp.Dispose()
    }
    finally { $img.Dispose() }
}

Write-Host ''
Write-Host '  扫描项目...' -ForegroundColor Cyan
Write-Host ''

if (-not (Test-Path $projDir)) {
    New-Item -ItemType Directory -Path $projDir | Out-Null
    Write-Host "  没有 projects 目录，已新建：$projDir" -ForegroundColor Yellow
}

$folders = Get-ChildItem $projDir -Directory -ErrorAction SilentlyContinue | Sort-Object Name
$list = @()
$savedBytes = 0

foreach ($folder in $folders) {

    # ---- 读 info.json ----
    $infoFile = Join-Path $folder.FullName 'info.json'
    $info = $null
    if (Test-Path $infoFile) {
        try {
            $info = (Get-Content $infoFile -Raw -Encoding UTF8) | ConvertFrom-Json
        }
        catch {
            Write-Host ("  [跳过] {0} 的 info.json 有误：{1}" -f $folder.Name, $_.Exception.Message) -ForegroundColor Red
            continue
        }
    }
    else {
        Write-Host ("  [提示] {0} 没有 info.json，先用文件夹名当标题" -f $folder.Name) -ForegroundColor Yellow
    }

    # ---- 收集图片 ----
    $files = Get-ChildItem $folder.FullName -File -ErrorAction SilentlyContinue |
             Where-Object { $imgExts -contains $_.Extension.ToLower() } |
             Sort-Object Name

    $webDir = Join-Path $folder.FullName 'web'
    if (Test-Path $webDir) { Remove-Item $webDir -Recurse -Force }


    $images = @()
    foreach ($f in $files) {
        $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
        $rel  = 'projects/' + $folder.Name + '/' + $f.Name

        $shrink = ($f.Length -gt $maxBytes)
        if (-not $shrink) {
            try {
                $probe = [System.Drawing.Image]::FromFile($f.FullName)
                $shrink = ($probe.Width -gt $maxW -or $probe.Height -gt $maxH)
                $probe.Dispose()
            }
            catch { }
        }

        if ($shrink) {
            if (-not (Test-Path $webDir)) { New-Item -ItemType Directory -Path $webDir | Out-Null }
            $destName = $base + $f.Extension.ToLower()
            $dest = Join-Path $webDir $destName
            try {
                Optimize-Image -Src $f.FullName -Dest $dest
                $savedBytes += ($f.Length - (Get-Item $dest).Length)
                $rel = 'projects/' + $folder.Name + '/web/' + $destName
            }
            catch {
                Write-Host ("  [提示] {0} 压缩失败，用原图" -f $f.Name) -ForegroundColor Yellow
            }
        }

        $images += [pscustomobject]@{ src = $rel; alt = $base; caption = $base }
    }

    # ---- 组装 ----
    $codeList = @()
    if ($info -and $info.code) { $codeList = @($info.code) }

    $list += [pscustomobject]@{
        id         = $folder.Name
        title      = if ($info -and $info.title) { $info.title } else { $folder.Name }
        subtitle   = if ($info) { $info.subtitle } else { '' }
        period     = if ($info) { $info.period }   else { '' }
        role       = if ($info) { $info.role }     else { '' }
        tags       = if ($info -and $info.tags) { @($info.tags) } else { @() }
        summary    = if ($info) { $info.summary }  else { '' }
        highlights = if ($info -and $info.highlights) { @($info.highlights) } else { @() }
        code          = $codeList
        download      = if ($info -and $info.download) { $info.download } else { '' }
        downloadLabel = if ($info -and $info.downloadLabel) { $info.downloadLabel } else { '' }
        images     = @($images)
    }

    Write-Host ("  {0,-24} {1,2} 张图   {2}" -f $folder.Name, $images.Count, $list[-1].title)
}

# ---- 写出 projects.js ----
$json = ConvertTo-Json -InputObject @($list) -Depth 8
if ($json -notmatch '^\s*\[') { $json = '[' + $json + ']' }

# PS 5.1 会把中文转成 \uXXXX，这里还原成可读中文
$json = [regex]::Replace($json, '\\u([0-9a-fA-F]{4})', {
    param($m) [string][char][Convert]::ToInt32($m.Groups[1].Value, 16)
})

$header = @"
/* ==========================================================
   本文件自动生成，请勿手改。
   改内容请编辑 projects/<项目名>/info.json，
   然后重新运行「刷新列表.ps1」。
   生成时间：$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
   ========================================================== */

window.PROJECTS =
"@

[System.IO.File]::WriteAllText($outFile, $header + $json + ";`r`n",
    (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
if ($savedBytes -gt 0) {
    Write-Host ("  图片已压缩，省下 {0:N0} KB" -f ($savedBytes / 1KB)) -ForegroundColor DarkGray
}
Write-Host ("  完成：{0} 个项目 -> assets/projects.js" -f $list.Count) -ForegroundColor Green
Write-Host '  双击 index.html 就能看到效果。' -ForegroundColor Green
Write-Host ''
