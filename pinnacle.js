(function() {
    console.log("🔄 Iniciando despliegue masivo en 2 fases con columna de Contexto independiente...");
    
    // FASE 1: Forzar la apertura de los bloques de mercados colapsados
    const mercadosColapsados = document.querySelectorAll('.marketGroup-wMlWprW2iC[data-collapsed="true"]');
    mercadosColapsados.forEach(m => {
        const header = m.querySelector('.collapse-title');
        if (header) header.click();
    });

    // Esperamos a que se muestren los contenidos antes de buscar los sub-botones
    setTimeout(() => {
        console.log("🔄 Fase 2: Expandiendo líneas secundarias...");
        
        const botonesMas = document.querySelectorAll('.button-VcnnvaBxJw');
        let clicsContados = 0;
        
        botonesMas.forEach(b => {
            if (b.innerText && !b.innerText.toLowerCase().includes("menos")) {
                b.click();
                clicsContados++;
            }
        });

        console.log(`Pulsados ${clicsContados} botones de expansión. Esperando renderizado...`);

        // Damos 600ms para garantizar el dibujado completo de las líneas
        setTimeout(() => {
            console.log("📊 Extrayendo mercados con columna de contexto separada...");
            
            const bloquesMercado = document.querySelectorAll('.marketGroup-wMlWprW2iC');
            const lineasCSV = [];
            
            // Nueva estructura de cabecera con la columna 'Contexto' separada
            lineasCSV.push("Mercado;Contexto;Seleccion;Cuota");

            bloquesMercado.forEach(bloque => {
                const tagTitulo = bloque.querySelector('.titleText-BgvECQYfHf');
                if (!tagTitulo) return;
                const nombreMercado = tagTitulo.innerText.trim();

                // Buscamos los botones de apuestas dentro de este bloque
                const botones = Array.from(bloque.querySelectorAll('.market-btn'));
                if (botones.length === 0) return;

                botones.forEach((boton, index) => {
                    const tagLabel = boton.querySelector('.label-GT4CkXEOFj');
                    const tagPrecio = boton.querySelector('.price-r5BU0ynJha');
                    
                    if (tagLabel && tagPrecio) {
                        const seleccion = tagLabel.innerText.trim();
                        let cuota = tagPrecio.innerText.trim();
                        
                        // Por defecto, la celda de la columna Contexto se queda completamente vacía
                        let contexto = ""; 
                        
                        // --- LÓGICA DE CLASIFICACIÓN EN COLUMNA SEPARADA ---
                        const mercadoMinusculas = nombreMercado.toLowerCase();
                        if (botones.length >= 2 && (mercadoMinusculas.includes("hándicap") || mercadoMinusculas.includes("total") || mercadoMinusculas.includes("goles"))) {
                            
                            // Si los botones se organizan en pares (columnas izquierda y derecha alternadas)
                            if (botones.length % 2 === 0) {
                                if (index % 2 === 0) {
                                    contexto = "Local";
                                } else {
                                    contexto = "Visitante";
                                }
                            } 
                            // Si los botones están agrupados en dos bloques verticales completos
                            else {
                                const mitad = botones.length / 2;
                                if (index < mitad) {
                                    contexto = "Local";
                                } else {
                                    contexto = "Visitante";
                                }
                            }
                        }

                        // Formatear cuotas con coma decimal para la configuración regional de España
                        if (!isNaN(cuota.replace(',', '.'))) {
                            cuota = cuota.replace('.', ',');
                        }
                        
                        // Guardamos cada columna entrecomillada y separada por punto y coma
                        lineasCSV.push(`"${nombreMercado}";"${contexto}";"${seleccion}";"${cuota}"`);
                    }
                });
            });

            if (lineasCSV.length <= 1) {
                alert("❌ No se pudieron extraer datos. Comprueba la carga de la página.");
                return;
            }

            // Timestamp para el archivo
            const ahora = new Date();
            const timestamp = `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}_${ahora.getHours().toString().padStart(2, '0')}-${ahora.getMinutes().toString().padStart(2, '0')}`;

            // Generar la descarga asegurando la codificación UTF-8 con BOM (\uFEFF)
            const contenidoCSV = "\uFEFF" + lineasCSV.join("\n");
            const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            
            link.href = URL.createObjectURL(blob);
            link.download = `pinnacle_columnas_${timestamp}.csv`;
            link.click();
            
            console.log(`✅ ¡Archivo generado! Extraídas ${lineasCSV.length - 1} líneas con columna de contexto independiente.`);
        }, 600); 

    }, 200);
})();
