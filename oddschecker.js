(function extraerDefinitivo() {
    const data = [];
    const ahora = new Date();
    
    // Formateo de nombre de archivo
    const f = `${ahora.getFullYear()}-${(ahora.getMonth()+1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}`;
    const h = `${ahora.getHours().toString().padStart(2, '0')}-${ahora.getMinutes().toString().padStart(2, '0')}`;
    const timestampCSV = ahora.toLocaleString();

    // 1. Mapa de casas (buscando cualquier enlace con data-bk)
    const bookieMap = {};
    document.querySelectorAll('a[data-bk]').forEach(el => {
        const id = el.getAttribute('data-bk');
        const name = el.getAttribute('title') || el.querySelector('img')?.alt || id;
        if (id) bookieMap[id] = name;
    });

    // 2. Buscar las filas de apuestas por clase genérica si el testid falla
    // Buscamos cualquier fila que parezca una fila de cuotas
    let rows = Array.from(document.querySelectorAll('[class*="BetRow"]'));
    
    // Si no hay filas por clase, intentamos por estructura de tabla
    if (rows.length === 0) {
        rows = Array.from(document.querySelectorAll('tr')).filter(tr => tr.querySelector('[data-bk]'));
    }

    // Filtrar solo las 3 primeras que tengan contenido (Local, Empate, Visitante)
    let filasProcesadas = 0;

    rows.forEach(row => {
        if (filasProcesadas >= 3) return;

        // Intentar sacar el nombre de la selección (Local, Empate o Visitante)
        const nameEl = row.querySelector('[data-testid="grid-bet"]') || 
                       row.querySelector('.bet-name') || 
                       row.firstElementChild;
        
        const selectionName = nameEl ? nameEl.innerText.trim() : null;
        if (!selectionName || selectionName === "") return;

        const cells = row.querySelectorAll('[data-bk]');
        if (cells.length > 0) {
            filasProcesadas++;
            cells.forEach(cell => {
                const bookieId = cell.getAttribute('data-bk');
                const quota = cell.innerText.trim();
                
                if (quota && quota !== '-' && quota !== 'SP') {
                    data.push({
                        "Fecha_Dato": timestampCSV,
                        "Seleccion": selectionName,
                        "Casa": bookieMap[bookieId] || bookieId,
                        "Cuota": quota.replace('.', ','),
                        "Tendencia": cell.parentElement.className.includes('Drifting') ? 'Bajando' : 
                                     cell.parentElement.className.includes('Shortening') ? 'Subiendo' : 'Estable'
                    });
                }
            });
        }
    });

    if (data.length === 0) {
        console.error("❌ Sigue sin detectar nada. Intenta hacer scroll en la página para que se carguen las cuotas y vuelve a ejecutarlo.");
        return;
    }

    // 3. CSV
    const headers = Object.keys(data[0]).join(';');
    const csvRows = data.map(obj => Object.values(obj).join(';'));
    const csvContent = "\uFEFF" + headers + "\n" + csvRows.join("\n");

    // 4. Descarga
    const nombreArchivo = `cuotas_oddschecker_es_${f}_${h}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();

    console.log(`✅ ¡Éxito! Archivo: ${nombreArchivo}`);
})();
