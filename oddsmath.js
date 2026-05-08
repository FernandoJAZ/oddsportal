// --- Script Ultra-Rápido para OddsMath ---

function formatOddsDate(dateStr) {
    // Convierte "May 08, 15:46" a "08/05/2026 15:46"
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const parts = dateStr.match(/(\w{3})\s(\d{1,2}),\s(\d{2}:\d{2})/);
    if (parts) {
        const day = parts[2].padStart(2, '0');
        const month = months[parts[1]];
        const time = parts[3];
        const year = new Date().getFullYear();
        return `${day}/${month}/${year} ${time}`;
    }
    return dateStr;
}

function extractOddsMathFast() {
    const allResults = [];
    // Buscamos todas las filas de la tabla de cuotas
    const rows = document.querySelectorAll('tr');

    rows.forEach(row => {
        const bookieNameEl = row.querySelector('.bookmaker-name');
        if (!bookieNameEl) return; // Si no hay nombre de bookie, saltamos la fila

        const bookmakerName = bookieNameEl.textContent.trim();
        
        // Buscamos las celdas de cuotas 1, X y 2
        // OddsMath usa clases odds-1, odds-X, odds-2
        ['1', 'X', '2'].forEach(label => {
            const cellSelector = `.odds-${label}`;
            const cell = row.querySelector(cellSelector);
            
            if (cell) {
                // Buscamos todos los registros del historial dentro del tooltip oculto
                const historyRows = cell.querySelectorAll('.history-row');
                
                historyRows.forEach(hRow => {
                    const timeEl = hRow.querySelector('.time');
                    const valueEl = hRow.querySelector('.odd-value');
                    const signEl = hRow.querySelector('.sign');

                    if (timeEl && valueEl) {
                        allResults.push({
                            bookmaker: bookmakerName,
                            apuesta: label,
                            fecha: formatOddsDate(timeEl.textContent.trim()),
                            cuota: valueEl.textContent.trim().replace('.', ','),
                            cambio: signEl ? signEl.textContent.trim().replace('.', ',') : '0',
                            tipo: hRow.classList.contains('opening-odds') ? 'Opening' : 'Movement'
                        });
                    }
                });
            }
        });
    });

    if (allResults.length > 0) {
        console.log(`✅ ¡Éxito! Se han extraído ${allResults.length} movimientos de cuotas.`);
        downloadCSV(allResults);
    } else {
        console.error("❌ No se encontraron datos. Asegúrate de estar en la tabla de comparación de cuotas.");
    }
}

function downloadCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `historial_oddsmath_${timestamp}.csv`);
    link.click();
}

// Ejecutar directamente
extractOddsMathFast();
