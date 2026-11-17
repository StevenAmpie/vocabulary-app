# Generate offline American English pronunciation files for every verb.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectRoot = Split-Path -Parent $PSScriptRoot
$records = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'verbs.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice('Microsoft Zira Desktop')
$speaker.Rate = -1
try {
  foreach ($record in $records) {
    $directory = Join-Path $projectRoot ("frontend/public/media/verbs/" + $record.slug)
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    $output = Join-Path $directory 'audio.wav'
    $speaker.SetOutputToWaveFile($output)
    $speaker.Speak([string]$record.termEn)
    $speaker.SetOutputToNull()
    Write-Output ("{0}: {1}" -f $record.slug, $output)
  }
}
finally {
  $speaker.Dispose()
}
