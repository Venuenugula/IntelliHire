Add-Type -AssemblyName System.Drawing
$src = "c:\Users\LENOVO\IntelliHire\frontend\public\landing\reference-full.png"
$outDir = "c:\Users\LENOVO\IntelliHire\frontend\public\landing"
$img = [System.Drawing.Image]::FromFile($src)

function Save-Crop([string]$name, [int]$x, [int]$y, [int]$w, [int]$h) {
  $rect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $path = Join-Path $outDir ($name + ".png")
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Save-Crop "hero-visual" 175 95 244 300
Save-Crop "feature-cards" 0 625 419 108
Save-Crop "talent-graph-only" 95 835 324 88

$img.Dispose()
