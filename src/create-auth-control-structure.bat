@echo off
set "BASE_DIR=d:\_PROGECT\pr_aurora_admin\src\app\auth\auth-control"

echo Creating Auth Control Panel structure in %BASE_DIR%...

:: 1. Create Directories
if not exist "%BASE_DIR%" mkdir "%BASE_DIR%"
if not exist "%BASE_DIR%\components" mkdir "%BASE_DIR%\components"
if not exist "%BASE_DIR%\services" mkdir "%BASE_DIR%\services"
if not exist "%BASE_DIR%\models" mkdir "%BASE_DIR%\models"

:: 2. Create Component Subdirectories
:: Main Dashboard
if not exist "%BASE_DIR%\components\auth-control-dashboard" mkdir "%BASE_DIR%\components\auth-control-dashboard"
:: Tabs
if not exist "%BASE_DIR%\components\session-tab" mkdir "%BASE_DIR%\components\session-tab"
if not exist "%BASE_DIR%\components\tokens-tab" mkdir "%BASE_DIR%\components\tokens-tab"
if not exist "%BASE_DIR%\components\roles-tab" mkdir "%BASE_DIR%\components\roles-tab"
if not exist "%BASE_DIR%\components\simulator-tab" mkdir "%BASE_DIR%\components\simulator-tab"
if not exist "%BASE_DIR%\components\playground-tab" mkdir "%BASE_DIR%\components\playground-tab"
:: Shared Components
if not exist "%BASE_DIR%\components\shared" mkdir "%BASE_DIR%\components\shared"
if not exist "%BASE_DIR%\components\shared\token-status-card" mkdir "%BASE_DIR%\components\shared\token-status-card"
if not exist "%BASE_DIR%\components\shared\role-badge" mkdir "%BASE_DIR%\components\shared\role-badge"
if not exist "%BASE_DIR%\components\shared\json-editor" mkdir "%BASE_DIR%\components\shared\json-editor"
if not exist "%BASE_DIR%\components\shared\simulation-result" mkdir "%BASE_DIR%\components\shared\simulation-result"

:: 3. Create Service Files (Empty placeholders)
if not exist "%BASE_DIR%\services\auth-control.service.ts" type nul > "%BASE_DIR%\services\auth-control.service.ts"
if not exist "%BASE_DIR%\services\auth-simulator.service.ts" type nul > "%BASE_DIR%\services\auth-simulator.service.ts"
if not exist "%BASE_DIR%\services\auth-playground.service.ts" type nul > "%BASE_DIR%\services\auth-playground.service.ts"
if not exist "%BASE_DIR%\services\auth-notification.service.ts" type nul > "%BASE_DIR%\services\auth-notification.service.ts"
if not exist "%BASE_DIR%\services\auth-export.service.ts" type nul > "%BASE_DIR%\services\auth-export.service.ts"

:: 4. Create Model Files (Empty placeholders if not exist)
if not exist "%BASE_DIR%\models\auth-control.models.ts" type nul > "%BASE_DIR%\models\auth-control.models.ts"
if not exist "%BASE_DIR%\models\simulator.models.ts" type nul > "%BASE_DIR%\models\simulator.models.ts"
if not exist "%BASE_DIR%\models\playground.models.ts" type nul > "%BASE_DIR%\models\playground.models.ts"
if not exist "%BASE_DIR%\models\index.ts" type nul > "%BASE_DIR%\models\index.ts"

:: 5. Create Routes File
if not exist "%BASE_DIR%\auth-control.routes.ts" type nul > "%BASE_DIR%\auth-control.routes.ts"

echo ===================================================
echo Auth Control Panel Structure Created Successfully!
echo Location: %BASE_DIR%
echo ===================================================
pause
