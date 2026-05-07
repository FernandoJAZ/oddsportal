# Scraper de Historial de Cuotas - CuotasAhora (ex-Oddsportal)

Este script de **JavaScript** permite extraer automáticamente el historial de movimientos de cuotas (Opening y Movements) del sitio web `cuotasahora.com` (la versión regional de Oddsportal). 

El script automatiza la tarea de hacer clic en cada casa de apuestas, abrir el modal de historial, capturar los datos y exportarlos a un archivo **CSV** listo para análisis en Excel o Python.

## 🚀 ¿Qué se consigue con este script?

Al ejecutar el código, obtendrás un archivo descargable con los siguientes datos por cada movimiento detectado:

*   **Bookmaker:** Nombre de la casa de apuestas.
*   **Apuesta:** Mercado identificado (1, X, 2).
*   **Fecha:** Fecha y hora del cambio de cuota (formateada a `DD/MM/YYYY HH:MM`).
*   **Cuota:** Valor de la cuota en ese momento (con formato decimal europeo `,`).
*   **Cambio:** Variación respecto a la cuota anterior.
*   **Tipo:** Clasificación del registro (`Opening` para la apertura o `Movement` para cambios posteriores).

## 🛠️ Cómo funciona el script

El script utiliza una lógica de **automatización secuencial**:

1.  **Identificación:** Localiza todas las cuotas clicables en la tabla comparativa.
2.  **Iteración:** Recorre cada cuota una por una para evitar bloqueos.
3.  **Simulación de Usuario:** 
    *   Hace `scroll` hasta la cuota para asegurar que sea visible.
    *   Realiza un `click` para abrir el modal emergente de historial.
4.  **Extracción Dinámica:** Espera un tiempo prudencial (`delay`) para que los datos carguen vía AJAX y extrae la información del DOM del modal.
5.  **Limpieza:** Cierra el modal y pasa a la siguiente casilla.
6.  **Exportación:** Una vez finalizado el recorrido, genera un `Blob` de datos y dispara la descarga automática del CSV.

## 📖 Instrucciones de uso

1.  Entra en la página del partido que desees analizar en [CuotasAhora](https://www.cuotasahora.com/).
2.  Asegúrate de estar en la pestaña de comparación de cuotas (por ejemplo, el mercado 1X2).
3.  Abre las **Herramientas de Desarrollador** de tu navegador:
    *   Presiona `F12` o `Ctrl + Shift + I` (en Firefox o Chrome).
4.  Haz clic en la pestaña **Consola (Console)**.
5.  Copia y pega el código íntegro del archivo `cuotas.js` de este repositorio.
6.  Pulsa `Enter`.
7.  **No cierres la pestaña** ni cambies de ventana hasta que el script termine y veas el mensaje `✅ Proceso completado` en la consola. El archivo CSV se descargará automáticamente.

## ⚙️ Configuración (Opcional)

Si tu conexión a internet es lenta o el sitio web tarda en cargar los modales, puedes modificar el tiempo de espera al final del script:

```javascript
extractAllOddsSequentially(2000); // 2000 representa 2 segundos de espera por cada click

## ⚠️ Notas y Requisitos

*   **Entorno:** Diseñado exclusivamente para ejecutarse en el navegador (Client-side).
*   **Compatibilidad:** Optimizado para **Firefox** y **Chrome**.
*   **Idioma:** Soporta fechas tanto en inglés (`Jan`, `Feb`...) como en español (`ene`, `feb`...).
*   **Uso Ético:** Este script es para fines educativos y de análisis de datos personal. Úsalo de forma responsable para no saturar los servidores del sitio web.
