// --- Funciones de Utilidad ---

function formatOddsDate(dateStr) {
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };
    const parts = dateStr.match(/(\d{1,2}) (\w{3}), (\d{2}:\d{2})/i);
    if (parts) {
        const day = parts[1].padStart(2, '0');
        const monthKey = parts[2].toLowerCase();
        const month = months[monthKey] || '01';
        const time = parts[3];
        const currentYear = new Date().getFullYear();
        return `${day}/${month}/${currentYear} ${time}`;
    }
    return dateStr;
}

function formatOddsValue(oddStr) {
    return oddStr.replace('.', ',');
}

function extractOddsFromDiv(div, bookmakerName, outcomeLabel) {
    const isOpening = div.innerText.toLowerCase().includes('opening') || (div.querySelector('.flex.gap-1') && !div.querySelector('.flex.flex-row.gap-4'));
    const allExtractedOdds = [];

    if (isOpening) {
        const openingBox = div.querySelector('.flex.gap-1');
        if (openingBox) {
            const divs = Array.from(openingBox.querySelectorAll('div'));
            const rawDate = divs[0] ? divs[0].textContent.trim() : 'N/A';
            const oddsDiv = openingBox.querySelector('.font-bold');
            
            const formattedDate = rawDate !== 'N/A' ? formatOddsDate(rawDate) : 'N/A';
            const rawOdd = oddsDiv ? oddsDiv.textContent.trim() : 'N/A';
            const formattedOdd = rawOdd !== 'N/A' ? formatOddsValue(rawOdd) : 'N/A';

            allExtractedOdds.push({
                bookmaker: bookmakerName,
                apuesta: outcomeLabel,
                fecha: formattedDate,
                cuota: formattedOdd,
                cambio: 'N/A',
                tipo: 'Opening'
            });
        }
    } else {
        const columnsContainer = div.querySelector('.flex.flex-row.gap-4');
        if (columnsContainer) {
            const cols = Array.from(columnsContainer.querySelectorAll('.flex.flex-col.gap-1.text-xs'));
            if (cols.length >= 2) {
                const dates = Array.from(cols[0].querySelectorAll('div')).map(el => formatOddsDate(el.textContent.trim()));
                const odds = Array.from(cols[1].querySelectorAll('.font-bold')).map(el => formatOddsValue(el.textContent.trim()));
                const changes = cols[2] ? Array.from(cols[2].querySelectorAll('div')).map(el => formatOddsValue(el.textContent.trim())) : [];

                const maxLength = Math.max(dates.length, odds.length);
                for (let i = 0; i < maxLength; i++) {
                    allExtractedOdds.push({
                        bookmaker: bookmakerName,
                        apuesta: outcomeLabel,
                        fecha: dates[i] || 'N/A',
                        cuota: odds[i] || 'N/A',
                        cambio: changes[i] || 'N/A',
                        tipo: 'Movement'
                    });
                }
            }
        }
    }
    return allExtractedOdds;
}

function convertToCSV(data) {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    data.forEach(row => {
        const values = headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`);
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
}

function downloadCSV(csvData) {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const filename = `historial_cuotasahora_${timestamp}.csv`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
}

// --- Función Principal ---

async function extractAllOddsSequentially(delay = 1800) {
    const allResults = [];
    
    // 1. Identificar labels de las columnas (1, X, 2)
    const headers = Array.from(document.querySelectorAll('div[data-testid="betting-tip-header"] p, .fe-header p'));
    let outcomeLabels = headers.length >= 2 ? headers.map(el => el.textContent.trim()) : ['1', 'X', '2'];
    console.log("Labels detectados:", outcomeLabels);

    const oddContainers = Array.from(document.querySelectorAll('div[data-testid="odd-container"]'));

    for (let i = 0; i < oddContainers.length; i++) {
        const container = oddContainers[i];
        
        // 2. Buscar la fila (row) de forma más robusta
        const row = container.closest('div[data-testid*="row"]') || container.closest('.border-b') || container.parentElement.parentElement;
        
        // 3. Extraer nombre de la Bookmaker (intentando varios selectores)
        let bookmakerName = "Unknown";
        const bookieEl = row.querySelector('p[data-testid*="bookmaker-name"]') || 
                         row.querySelector('a[href*="/bookmaker/"] p') ||
                         row.querySelector('.provider-name') ||
                         row.querySelector('a[href*="/bookmaker/"]');
        
        if (bookieEl) bookmakerName = bookieEl.textContent.trim();

        // 4. Determinar la Apuesta (1, X, 2) basándonos en la posición
        const rowContainers = Array.from(row.querySelectorAll('div[data-testid="odd-container"]'));
        const colIndex = rowContainers.indexOf(container);
        const label = outcomeLabels[colIndex] || "N/A";

        const clickable = container.querySelector('p') || container.querySelector('span') || container;

        console.log(`[${i+1}/${oddContainers.length}] Procesando: ${bookmakerName} | Apuesta: ${label}`);

        try {
            clickable.scrollIntoView({ behavior: 'auto', block: 'center' });
            clickable.click();
            
            await new Promise(r => setTimeout(r, delay));

            // Extraer datos del modal
            const modalBlocks = document.querySelectorAll('.bg-gray-light.flex.flex-col, div[class*="bg-gray-light"]');
            modalBlocks.forEach(block => {
                const data = extractOddsFromDiv(block, bookmakerName, label);
                if (data.length > 0) allResults.push(...data);
            });

            // Cerrar modal
            const closeBtn = document.querySelector('div[aria-label="Close dialog"]') || 
                             document.querySelector('.closebtn-notif') ||
                             document.querySelector('div[role="button"] .bg-close-X-black') ||
                             document.querySelector('button[aria-label="Close"]');
            
            if (closeBtn) {
                closeBtn.click();
                await new Promise(r => setTimeout(r, 600));
            }
        } catch (e) {
            console.error("Error en celda", i, e);
        }
    }

    if (allResults.length > 0) {
        console.log("✅ Proceso completado con éxito.");
        downloadCSV(convertToCSV(allResults));
    } else {
        console.error("❌ No se extrajeron datos. Asegúrate de que el modal de cuotas se esté abriendo correctamente.");
    }
}

extractAllOddsSequentially();
