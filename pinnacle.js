(function() {
    console.log("🔄 Iniciando despliegue masivo en 2 fases...");
    
    // FASE 1: Forzar la apertura de los bloques de mercados colapsados
    // Buscamos cualquier contenedor de mercado que tenga el atributo data-collapsed="true"
    const mercadosColapsados = document.querySelectorAll('.marketGroup-wMlWprW2iC[data-collapsed="true"]');
    mercadosColapsados.forEach(m => {
        const header = m.querySelector('.collapse-title');
        if (header) header.click();
    });

    // Esperamos un instante a que se muestren los contenidos internos antes de buscar los sub-botones
    setTimeout(() => {
        console.log("🔄 Fase 2: Expandiendo líneas secundarias ('Ver más' / 'Más información')...");
        
        // Buscamos todos los botones internos de expansión (clase general button-VcnnvaBxJw)
        // Hacemos clic solo en aquellos que NO digan "Ver menos"
        const botonesMas = document.querySelectorAll('.button-VcnnvaBxJw');
        let clicsContados = 0;
        
        botonesMas.forEach(b => {
            if (b.innerText && !b.innerText.toLowerCase().includes("menos")) {
                b.click();
                clicsContados++;
            }
        });

        console.log(`Pulsados ${clicsContados} botones de expansión. Esperando renderizado...`);

        // Damos un margen de tiempo ligeramente mayor (500ms) para garantizar que las >300 líneas se dibujen en el HTML
        setTimeout(() => {
            console.log("📊 Extrayendo el total absoluto de mercados...");
            
            const bloquesMercado = document.querySelectorAll('.marketGroup-wMlWprW2iC');
            const lineasCSV = [];
            
            lineasCSV.push("Mercado;Seleccion;Cuota");

            bloquesMercado.forEach(bloque => {
                const tagTitulo = bloque.querySelector('.titleText-BgvECQYfHf');
                if (!tagTitulo) return;
                const nombreMercado = tagTitulo.innerText.trim();

                const botones = bloque.querySelectorAll('.market-btn');
                
                botones.forEach(boton => {
                    const tagLabel = boton.querySelector('.label-GT4CkXEOFj');
                    const tagPrecio = boton.querySelector('.price-r5BU0ynJha');
                    
                    if (tagLabel && tagPrecio) {
                        const seleccion = tagLabel.innerText.trim();
                        let cuota = tagPrecio.innerText.trim();
                        
                        if (!isNaN(cuota.replace(',', '.')) && cuota.includes('.')) {
                            cuota = cuota.replace('.', ',');
                        }
                        
                        lineasCSV.push(`"${nombreMercado}";"${seleccion}";"${cuota}"`);
                    }
                });
            });

            if (lineasCSV.length <= 1) {
                alert("❌ No se pudieron extraer datos. Asegúrate de que la página ha cargado correctamente.");
                return;
            }

            // Formatear fecha y hora actual (_HH-MM)
            const ahora = new Date();
            const año = ahora.getFullYear();
            const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
            const dia = ahora.getDate().toString().padStart(2, '0');
            const hora = ahora.getHours().toString().padStart(2, '0');
            const mins = ahora.getMinutes().toString().padStart(2, '0');
            
            const timestamp = `${año}-${mes}-${dia}_${hora}-${mins}`;

            // Generar la descarga
            const contenidoCSV = "\uFEFF" + lineasCSV.join("\n");
            const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            
            link.href = URL.createObjectURL(blob);
            link.download = `pinnacle_mercados_completos_${timestamp}.csv`;
            link.click();
            
            console.log(`✅ ¡Éxito rotundo! Archivo guardado con la hora exacta. Extraídas ${lineasCSV.length - 1} líneas de apuestas.`);
        }, 500); 

    }, 200);
})();
