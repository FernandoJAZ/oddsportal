(function extraerBetfairNativo() {
    console.log("🚀 Iniciando extracción nativa basada en estructura HTML...");

    // 1. Obtener datos globales de la cabecera
    const totalMatchedEl = document.querySelector('.total-matched');
    const volumenTotal = totalMatchedEl ? totalMatchedEl.innerText.replace('EUR', '').trim() : 'N/A';

    const backBookEl = document.querySelector('.rh-back-book-percentage-label');
    const layBookEl = document.querySelector('.rh-lay-book-percentage-label');
    const ovBack = backBookEl ? backBookEl.innerText.trim() : 'N/A';
    const ovLay = layBookEl ? layBookEl.innerText.trim() : 'N/A';

    const data = [];
    const ahora = new Date();
    const timestamp = ahora.toLocaleString();

    // 2. Localizar las filas de los competidores
    const runnerRows = document.querySelectorAll('tr.runner-line');

    if (runnerRows.length === 0) {
        console.error("❌ No se encontraron filas 'tr.runner-line'. Asegúrate de estar en el mercado 1X2.");
        return;
    }

    runnerRows.forEach(row => {
        // Extraer nombre de la selección (Almería, etc.)
        const nameEl = row.querySelector('.runner-name');
        if (!nameEl) return;
        const seleccion = nameEl.innerText.trim();

        // --- APUESTA A FAVOR (BLUE/BACK) ---
        // Buscamos el botón específico que tiene la marca de mejor selección
        const bestBackBtn = row.querySelector('button.back[is-best-selection="true"]');
        let cuotaBack = 'N/A';
        let dineroBack = 'N/A';
        let probBack = 'N/A';

        if (bestBackBtn) {
            const labels = bestBackBtn.querySelectorAll('label');
            if (labels.length >= 2) {
                cuotaBack = labels[0].innerText.trim().replace('.', ',');
                dineroBack = labels[1].innerText.trim().replace('€', '').trim();
                
                const cNum = parseFloat(labels[0].innerText.trim());
                probBack = ((1 / cNum) * 100).toFixed(2).replace('.', ',');
            }
        }

        // --- APUESTA EN CONTRA (PINK/LAY) ---
        // Buscamos el botón rosa que tiene la marca de mejor selección
        const bestLayBtn = row.querySelector('button.lay[is-best-selection="true"]');
        let cuotaLay = 'N/A';
        let dineroLay = 'N/A';
        let probLay = 'N/A';

        if (bestLayBtn) {
            const labels = bestLayBtn.querySelectorAll('label');
            if (labels.length >= 2) {
                cuotaLay = labels[0].innerText.trim().replace('.', ',');
                dineroLay = labels[1].innerText.trim().replace('€', '').trim();
                
                const cNum = parseFloat(labels[0].innerText.trim());
                probLay = ((1 / cNum) * 100).toFixed(2).replace('.', ',');
            }
        }

        // Estructurar el objeto de datos
        data.push({
            "Fecha_Captura": timestamp,
            "Volumen_Mercado": volumenTotal,
            "Seleccion": seleccion,
            "Cuota_A_Favor": cuotaBack,
            "Prob_A_Favor_%": probBack,
            "Liquidez_A_Favor": dineroBack,
            "Cuota_En_Contra": cuotaLay,
            "Prob_En_Contra_%": probLay,
            "Liquidez_En_Contra": dineroLay,
            "Overround_Total_Back": ovBack,
            "Overround_Total_Lay": ovLay
        });
    });

    // 3. Crear y descargar el documento CSV
    if (data.length > 0) {
        const headers = Object.keys(data[0]).join(';');
        const csvRows = data.map(obj => Object.values(obj).join(';'));
        const csvContent = "\uFEFF" + headers + "\n" + csvRows.join("\n");

        const f = `${ahora.getFullYear()}-${(ahora.getMonth()+1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}`;
        const h = `${ahora.getHours().toString().padStart(2, '0')}-${ahora.getMinutes().toString().padStart(2, '0')}`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `betfair_precision_1X2_${f}_${h}.csv`;
        link.click();
        console.log("✅ CSV de Betfair Precision descargado con éxito.");
    } else {
        console.error("❌ Error al procesar las cuotas del HTML.");
    }
})();
