@echo off
echo Creating Health Monitoring structure...

:: Создание папок
mkdir app\shared\health\models
mkdir app\shared\health\services
mkdir app\shared\health\components\health-indicator
mkdir app\shared\health\components\health-panel-details

:: Создание пустых файлов
type nul > app\shared\health\models\health.model.ts
type nul > app\shared\health\services\health.service.ts

type nul > app\shared\health\components\health-indicator\health-indicator.component.ts
type nul > app\shared\health\components\health-indicator\health-indicator.component.html
type nul > app\shared\health\components\health-indicator\health-indicator.component.scss

type nul > app\shared\health\components\health-panel-details\health-panel-details.component.ts
type nul > app\shared\health\components\health-panel-details\health-panel-details.component.html
type nul > app\shared\health\components\health-panel-details\health-panel-details.component.scss

echo.
echo [DONE] Structure for Health Monitor created successfully on Latin characters.
pause
