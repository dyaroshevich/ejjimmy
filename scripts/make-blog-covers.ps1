# Builds the 16:10 blog covers from the owner's photo set in public/images/broll/.
#
# The blog card box is exactly 16:10 (globals.css `.case-img`) and the article
# hero renders the image at its own ratio, so one 16:10 pre-crop gives both
# surfaces the same frame — no CSS crop, no portrait stretching.
#
# The focal anchors come from the owner's own video compositions
# (src/video/compositions/solar2/*.tsx, the `position:` on each broll shot).
# `ay` is the vertical anchor: 30 keeps the top of the frame, 50 is the middle.
#
# Run:  powershell -ExecutionPolicy Bypass -File scripts/make-blog-covers.ps1
Add-Type -AssemblyName System.Drawing

$map = @(
  @{ src = 'resort-panels.jpg'; ax = 50; ay = 50 },
  @{ src = 'abstract-energy.jpg'; ax = 50; ay = 30 },
  @{ src = 'house-water.jpg'; ax = 50; ay = 50 },
  @{ src = 'crew-install.jpg'; ax = 50; ay = 40 },
  @{ src = 'engineer.jpg'; ax = 50; ay = 35 },
  @{ src = 'battery-wall.jpg'; ax = 50; ay = 45 },
  @{ src = 'shop-day.jpg'; ax = 50; ay = 30 },
  @{ src = 'villa-sunset.jpg'; ax = 50; ay = 50 },
  @{ src = 'hex-cells.jpg'; ax = 50; ay = 50 },
  @{ src = 'villa-sea.jpg'; ax = 50; ay = 50 }
)

$outDir = 'public\images\blog-covers'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$TW = 960
$TH = 600
$ratio = $TW / $TH

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = New-Object System.Drawing.Imaging.EncoderParameters(1)
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 82L)

foreach ($m in $map) {
  $srcPath = "public\images\broll\$($m.src)"
  if (-not (Test-Path -LiteralPath $srcPath)) { Write-Output "skip $($m.src) (missing)"; continue }
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)

  $sw = $img.Width
  $sh = $img.Height
  $cw = $sw
  $ch = [int][math]::Round($sw / $ratio)
  if ($ch -gt $sh) { $cw = [int][math]::Round($sh * $ratio); $ch = $sh }
  $x = [int][math]::Round(($sw - $cw) * ($m.ax / 100))
  $y = [int][math]::Round(($sh - $ch) * ($m.ay / 100))

  $dst = New-Object System.Drawing.Bitmap($TW, $TH)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $TW, $TH)), $x, $y, $cw, $ch, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  $outPath = Join-Path $outDir $m.src
  $dst.Save((Join-Path (Get-Location) $outPath), $codec, $enc)
  $dst.Dispose()
  $img.Dispose()
  Write-Output ("{0,-24} {1}x{2} -> {3}x{4}  {5}KB" -f $m.src, $sw, $sh, $TW, $TH, [math]::Round((Get-Item $outPath).Length/1KB))
}
