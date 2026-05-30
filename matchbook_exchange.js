(function extraerMatchbookPrecision() {
    console.log("🚀 Iniciando extracción nativa en Matchbook...");

    // 1. Extraer y limpiar el Volumen Total de Mercado
    let volumenTotal = '0';
    const spans = document.querySelectorAll('[class*="matchedVolume"]');
    for (let s of spans) {
        if (s.innerText.includes('Matched')) {
            // Quitamos las etiquetas de texto y el símbolo de moneda para dejar solo el número
            volumenTotal = s.innerText.replace('Matched Volume:', '').replace('€', '').trim();
            break;
        }
    }

    const data = [];
    const ahora = new Date();
    const timestamp = ahora.toLocaleString();

    // Variables acumuladoras para el cálculo matemático de los Overrounds
    let sumaProbBack = 0;
    let sumaProbLay = 0;

    // 2. Seleccionar las filas de los competidores (Runners del mercado 1X2)
    const runners = document.querySelectorAll('.Runner-module__runner___5M+Z2, [class*="Runner-module__runner"]');

    if (runners.length === 0) {
        alert("❌ No se detectó el mercado. Asegúrate de estar en la página del partido en Matchbook.");
        return;
    }

    runners.forEach((runner, index) => {
        // Extraer el nombre de la selección (Equipo o Empate)
        const nameEl = runner.querySelector('[class*="variable"]');
        const seleccion = nameEl ? nameEl.innerText.trim() : `Selección ${index}`;

        // --- ZONA AZUL: MEJOR CUOTA A FAVOR (BACK) ---
        const backBtn = runner.querySelector(`[data-hook="market-0--runner-${index}--price-0-back"]`);
        let cuotaBack = 'N/A', dineroBack = 'N/A', probBackStr = 'N/A';

        if (backBtn) {
            const oddsEl = backBtn.querySelector('[class*="odds"]');
            const amountEl = backBtn.querySelector('[class*="amount"]');
            if (oddsEl) {
                // Formateamos con coma para compatibilidad directa con Excel en español
                cuotaBack = oddsEl.innerText.trim().replace('.', ',');
                dineroBack = amountEl ? amountEl.innerText.trim().replace('€', '') : '0';
                
                const cNum = parseFloat(oddsEl.innerText.trim());
                if (!isNaN(cNum) && cNum > 0) {
                    const pNum = (1 / cNum) * 100;
                    sumaProbBack += pNum;
                    probBackStr = pNum.toFixed(2).replace('.', ',');
                }
            }
        }

        // --- ZONA ROSA: MEJOR CUOTA EN CONTRA (LAY) ---
        const layBtn = runner.querySelector(`[data-hook="market-0--runner-${index}--price-0-lay"]`);
        let cuotaLay = 'N/A', dineroLay = 'N/A', probLayStr = 'N/A';

        if (layBtn) {
            const oddsEl = layBtn.querySelector('[class*="odds"]');
            const amountEl = layBtn.querySelector('[class*="amount"]');
            if (oddsEl) {
                cuotaLay = oddsEl.innerText.trim().replace('.', ',');
                dineroLay = amountEl ? amountEl.innerText.trim().replace('€', '') : '0';
                
                const cNum = parseFloat(oddsEl.innerText.trim());
                if (!isNaN(cNum) && cNum > 0) {
                    const pNum = (1 / cNum) * 100;
                    sumaProbLay += pNum;
                    probLayStr = pNum.toFixed(2).replace('.', ',');
                }
            }
        }

        // Estructura inicial de la fila
        data.push({
            "Fecha_Captura": timestamp,
            "Volumen_Mercado": volumenTotal,
            "Seleccion": seleccion,
            "Cuota_A_Favor": cuotaBack,
            "Prob_A_Favor_%": probBackStr,
            "Liquidez_A_Favor": dineroBack,
            "Cuota_En_Contra": cuotaLay,
            "Prob_En_Contra_%": probLayStr,
            "Liquidez_En_Contra": dineroLay,
            "Overround_Back": '0%', 
            "Overround_Lay": '0%'
        });
    });

    // 3. Calcular y formatear los Overrounds finales de forma precisa
    const finalOvBack = sumaProbBack > 0 ? sumaProbBack.toFixed(2).replace('.', ',') + '%' : 'N/A';
    const finalOvLay = sumaProbLay > 0 ? sumaProbLay.toFixed(2).replace('.', ',') + '%' : 'N/A';

    // Inyectar el cálculo matemático en todas las filas del set de datos
    data.forEach(item => {
        item["Overround_Back"] = finalOvBack;
        item["Overround_Lay"] = finalOvLay;
    });

    // 4. Construir el archivo CSV y forzar la descarga en el navegador
    if (data.length > 0) {
        const headers = Object.keys(data[0]).join(';');
        const csvRows = data.map(obj => Object.values(obj).join(';'));
        
        // Incluye el BOM (\uFEFF) para que Excel reconozca los caracteres especiales y tildes correctamente
        const csvContent = "\uFEFF" + headers + "\n" + csvRows.join("\n");

        // Formatear fecha y hora para el nombre del archivo
        const f = `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}`;
        const h = `${ahora.getHours().toString().padStart(2, '0')}-${ahora.getMinutes().toString().padStart(2, '0')}`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `matchbook_precision_1X2_${f}_${h}.csv`;
        
        // Simular clic para descargar
        link.click();
        console.log("✅ CSV de Matchbook Precision exportado correctamente.");
    } else {
        alert("❌ Error al procesar y estructurar las columnas de datos.");
    }
})();
