// --- Extractor Automático de Historiales Completos para OddsRun ---

function formatOddsRunDate(dateStr) {
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const cleaned = dateStr.replace(/\s+/g, '');
    const parts = cleaned.match(/(\d{2}),(\w{3})(\d{2}:\d{2})/);
    if (parts) {
        const day = parts[1];
        const month = months[parts[2]];
        const time = parts[3];
        const year = new Date().getFullYear();
        const isoString = `${year}-${month}-${day}T${time}:00+02:00`;
        const dateBase = new Date(isoString);
        if (isNaN(dateBase.getTime())) return dateStr;
        return dateBase.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    }
    return dateStr;
}

async function extractAllOddsRunHistories() {
    console.log("🚀 Iniciando escaneo automatizado de todas las cuotas en OddsRun...");
    const allResults = [];
    const rows = document.querySelectorAll('tbody tr');

    if (rows.length === 0) {
        console.error("❌ No se encontró la tabla de cuotas.");
        return;
    }

    // Función auxiliar para pausar la ejecución y dar tiempo a que React pinte el HTML
    const delay = ms => new Promise(res => setTimeout(res, ms));

    for (let row of rows) {
        const bookieNameEl = row.querySelector('.MatchWithOdds_numbersOfBet__YUD61');
        if (!bookieNameEl) continue; // Saltamos filas de promedios o vacías

        const bookmakerName = bookieNameEl.textContent.trim();
        const buttons = row.querySelectorAll('td.text-center button.dropdown-toggle');
        
        const labels = ['1', 'X', '2'];

        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            const label = labels[i] || `Cuota_${i+1}`;

            // 1. Forzar clic simulado en el botón de la cuota para abrir el desplegable
            btn.click();
            await delay(120); // Esperamos 120ms a que el DOM se actualice con el historial

            const cell = btn.closest('td.text-center');

            // 2. Extraer los movimientos históricos cargados en el scroll
            const movementRows = cell.querySelectorAll('.MatchWithOdds_movementScrollFitContent__qICd\\+ .MatchWithOdds_timeAndDate__fWjof');
            movementRows.forEach(mRow => {
                const dateEl = mRow.querySelector('date');
                const valueEl = mRow.querySelector('.MatchWithOdds_profit__EnU84');
                const changeEl = mRow.querySelector('[class*="MatchWithOdds_down"], [class*="MatchWithOdds_up"]');

                if (dateEl && valueEl) {
                    allResults.push({
                        bookmaker: bookmakerName,
                        apuesta: label,
                        fecha: formatOddsRunDate(dateEl.textContent.trim()),
                        cuota: valueEl.textContent.trim().replace('.', ','),
                        cambio: changeEl ? changeEl.textContent.trim().replace('.', ',') : '0',
                        tipo: 'Movement'
                    });
                }
            });

            // 3. Extraer la cuota de apertura (Opening)
            const openingTimeEl = cell.querySelector('.MatchWithOdds_joiningTimeOdds__KnnuI + .MatchWithOdds_timeAndDate__fWjof');
            const openingValueEl = cell.querySelector('.MatchWithOdds_joiningTimeOdds__KnnuI ~ .MatchWithOdds_profit__EnU84');

            if (openingTimeEl && openingValueEl) {
                allResults.push({
                    bookmaker: bookmakerName,
                    apuesta: label,
                    fecha: formatOddsRunDate(openingTimeEl.textContent.trim()),
                    cuota: openingValueEl.textContent.trim().replace('.', ','),
                    cambio: '0',
                    tipo: 'Opening'
                });
            }

            // 4. Si no se detectó historial pero hay cuota en el botón, la añadimos como actual
            if (movementRows.length === 0 && !openingTimeEl) {
                const staticSpan = btn.querySelector('span:last-child');
                if (staticSpan && staticSpan.textContent.trim() !== '') {
                    allResults.push({
                        bookmaker: bookmakerName,
                        apuesta: label,
                        fecha: new Date().toLocaleString('es-ES'),
                        cuota: staticSpan.textContent.trim().replace('.', ','),
                        cambio: '0',
                        tipo: 'Current'
                    });
                }
            }

            // 5. Volver a hacer clic para cerrar el menú y limpiar la pantalla antes del siguiente paso
            btn.click();
            await delay(50);
        }
    }

    if (allResults.length > 0) {
        console.log(`\n✅ ¡Proceso completado! Se han recopilado ${allResults.length} movimientos de todas las casas.`);
        downloadCSV(allResults);
    } else {
        console.error("❌ No se pudieron recuperar datos. Comprueba que las cuotas sean interactivas.");
    }
}

function downloadCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = "\uFEFF" + [
        headers.join(';'),
        ...data.map(row => headers.map(h => `"${row[h]}"`).join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10) + '_' + new Date().toTimeString().slice(0, 5).replace(':', '-');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `historial_TOTAL_oddsrun_${timestamp}.csv`);
    link.click();
}

// Ejecutar bucle automático
extractAllOddsRunHistories();
