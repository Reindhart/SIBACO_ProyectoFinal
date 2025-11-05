# Script de prueba de autenticación

# 1. Login
Write-Host "=== Login ===" -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"admin","password":"admin123"}' `
    -ErrorAction Stop

$token = $loginResponse.data.access_token
Write-Host "Token obtenido: $($token.Substring(0, 50))..." -ForegroundColor Green

# 2. Llamar a /me con el token
Write-Host "`n=== Get Current User ===" -ForegroundColor Cyan
try {
    $meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
        -Method GET `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        } `
        -ErrorAction Stop
    
    Write-Host "Usuario obtenido:" -ForegroundColor Green
    $meResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error al obtener usuario:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Message: $($_.Exception.Message)"
    $_.Exception.Response | Format-List *
}
