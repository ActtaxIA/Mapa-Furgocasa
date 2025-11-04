@echo off
echo Desplegando version 1.0.0...

cd /d "E:\Acttax Dropbox\Narciso Pardo\Acttax\EI - FURGOCASA\1 - ADMINISTRACION\7 - ACTIVOS\6 - MAPA FURGOCASA\NEW MAPA FURGOCASA"

git add -A

git commit -m "feat: Version 1.0.0 - Sistema completo operativo"

git push origin main

echo Deploy completado!
pause

