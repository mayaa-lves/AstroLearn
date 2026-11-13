$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
if (!(Test-Path (Join-Path $root 'professor')) -or !(Test-Path (Join-Path $root 'public'))) {
  throw 'Coloque este arquivo na raiz do AstroLearn, ao lado das pastas professor e public.'
}
$entry = Join-Path $root 'public/js/components/professor-padrao.js'
if (!(Test-Path $entry)) { throw 'Copie primeiro a pasta public que veio neste pacote para a raiz do projeto.' }
$backup = Join-Path $root ('backup-professor-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$utf8 = New-Object System.Text.UTF8Encoding($false)
$tag = '<script type="module" src="../public/js/components/professor-padrao.js?v=1"></script>'
$count = 0
Get-ChildItem (Join-Path $root 'professor') -Filter '*.html' -File | ForEach-Object {
  $file = $_
  $original = [System.IO.File]::ReadAllText($file.FullName)
  # Desativa apenas o sino antigo docente; o novo componente usa o mesmo serviço de API.
  $updated = [regex]::Replace($original, '<script\b[^>]*\bsrc\s*=\s*["''][^"'']*components/professor-notificacoes\.js[^"'']*["''][^>]*>\s*</script>', '', 'IgnoreCase')
  if ($updated -notmatch 'components/professor-padrao\.js') {
    if ($updated -notmatch '</body\s*>') { throw ('Nao foi encontrado </body> em ' + $file.Name) }
    $updated = [regex]::Replace($updated, '</body\s*>', ($tag + "`r`n</body>"), 'IgnoreCase')
  }
  if ($updated -cne $original) {
    New-Item -ItemType Directory -Force -Path (Join-Path $backup 'professor') | Out-Null
    Copy-Item $file.FullName (Join-Path $backup ('professor/' + $file.Name))
    [System.IO.File]::WriteAllText($file.FullName, $updated, $utf8)
    $count++
  }
}
Write-Host ('Pronto! ' + $count + ' paginas atualizadas. Nenhum arquivo da area do aluno foi alterado.')
if ($count -gt 0) { Write-Host ('Backup das paginas anteriores: ' + $backup) }
Write-Host 'Abra a area do professor e pressione Ctrl + F5.'
