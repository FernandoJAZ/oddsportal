(function() {
    console.log("... Iniciando despliegue masivo basado en estructuras HTML nativas de Pinnacle...");
    
    // FASE 1: Forzar la apertura de los bloques de mercados colapsados
    const mercadosColapsados = document.querySelectorAll('.marketGroup-wMlWprW2iC[data-collapsed="true"]');
    mercadosColapsados.forEach(m => {
        const header = m.querySelector('.collapse-title');
        if (header) header.click();
    });

    // Esperamos a que se muestren los contenidos antes de buscar los sub-botones
    setTimeout(() => {
        console.log("... Fase 2: Expandiendo líneas secundarias...");
        
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
            console.log("📊 Extrayendo mercados aplicando lógica de contenedores reales...");
            
            const bloquesMercado = document.querySelectorAll('.marketGroup-wMlWprW2iC');
            const lineasCSV = [];
            
            // Tu estructura de 3 columnas
            lineasCSV.push("Mercado;Seleccion;Cuota");

            bloquesMercado.forEach(bloque => {
                const tagTitulo = bloque.querySelector('.titleText-BgvECQYfHf');
                if (!tagTitulo) return;
                const nombreMercado = tagTitulo.innerText.trim();

                // 1. DETECCIÓN DE CASO: 4 COLUMNAS (Estructura basada en contenedores '.column-S5OSwTijGg')
                const columnasEstructurales = bloque.querySelectorAll('.column-S5OSwTijGg');
                
                if (columnasEstructurales.length === 2) {
                    // Estamos ante el caso de 4 columnas (2 columnas visuales por cada equipo)
                    columnasEstructurales.forEach((columna, colIndex) => {
                        // colIndex === 0 es la columna entera del Local, colIndex === 1 es la del Visitante
                        const esLocal = (colIndex === 0);
                        
                        // Buscamos los grupos de Más/Menos dentro de esta columna
                        const gruposOpciones = columna.querySelectorAll('.groupedView-j_GaGC1xqH');
                        
                        gruposOpciones.forEach(grupo => {
                            const botonesGrupo = grupo.querySelectorAll('.market-btn');
                            
                            botonesGrupo.forEach((boton, btnIndex) => {
                                const tagLabel = boton.querySelector('.label-GT4CkXEOFj');
                                const tagPrecio = boton.querySelector('.price-r5BU0ynJha');
                                
                                if (tagLabel && tagPrecio) {
                                    const seleccion = tagLabel.innerText.trim();
                                    let cuota = tagPrecio.innerText.trim();
                                    
                                    // btnIndex 0 suele ser "Más de" (_1c) y btnIndex 1 suele ser "Menos de" (_2c)
                                    // Por seguridad, si el texto incluye "Menos", le metemos el _2c, si no, el _1c
                                    const sufijoColumna = seleccion.toLowerCase().includes("menos") ? "_2c" : "_1c";
                                    const designacionEquipo = esLocal ? "(Local)" : "(Visitante)";
                                    
                                    let mercadoFormateado = `${nombreMercado} _${sufijoColumna} ${designacionEquipo}`;

                                    if (!isNaN(cuota.replace(',', '.'))) {
                                        cuota = cuota.replace('.', ',');
                                    }
                                    lineasCSV.push(`"${mercadoFormateado}";"${seleccion}";"${cuota}"`);
                                }
                            });
                        });
                    });
                    return; // Fin del procesamiento para este bloque de 4 columnas
                }

                // 2. DETECCIÓN DE CASO: 2 COLUMNAS (Estructura basada en '.buttonRow-zWMLOGu5YB')
                const filasEstructurales = bloque.querySelectorAll('.buttonRow-zWMLOGu5YB');
                const tieneEstructuraFilas = filasEstructurales.length > 0;
                
                // Si tiene filas pero un mercado normal de 1 columna también cayera aquí, verificamos que haya botones emparejados
                const primerFilaBotones = tieneEstructuraFilas ? filasEstructurales[0].querySelectorAll('.market-btn') : [];
                
                if (tieneEstructuraFilas && primerFilaBotones.length === 2) {
                    filasEstructurales.forEach(fila => {
                        const botonesFila = fila.querySelectorAll('.market-btn');
                        botonesFila.forEach((boton, btnIndex) => {
                            const tagLabel = boton.querySelector('.label-GT4CkXEOFj');
                            const tagPrecio = boton.querySelector('.price-r5BU0ynJha');
                            
                            if (tagLabel && tagPrecio) {
                                const seleccion = tagLabel.innerText.trim();
                                let cuota = tagPrecio.innerText.trim();
                                
                                // En la fila horizontal: índice 0 es Local, índice 1 es Visitante
                                const sufijoEquipo = (btnIndex === 0) ? " (Local)" : " (Visitante)";
                                let mercadoFormateado = nombreMercado + sufijoEquipo;

                                if (!isNaN(cuota.replace(',', '.'))) {
                                    cuota = cuota.replace('.', ',');
                                }
                                lineasCSV.push(`"${mercadoFormateado}";"${seleccion}";"${cuota}"`);
                            }
                        });
                    });
                    return; // Fin del procesamiento para este bloque de 2 columnas
                }

                // 3. CASO DE RESIDUO / 1 COLUMNA (Ej: Resultado Final o listas corridas sin rejilla simétrica)
                const botonesSueltos = bloque.querySelectorAll('.market-btn');
                botonesSueltos.forEach(boton => {
                    const tagLabel = boton.querySelector('.label-GT4CkXEOFj');
                    const tagPrecio = boton.querySelector('.price-r5BU0ynJha');
                    
                    if (tagLabel && tagPrecio) {
                        const seleccion = tagLabel.innerText.trim();
                        let cuota = tagPrecio.innerText.trim();
                        
                        // No se añade ningún tipo de sufijo (Se queda limpio tal cual viene de la web)
                        let mercadoFormateado = nombreMercado;

                        if (!isNaN(cuota.replace(',', '.'))) {
                            cuota = cuota.replace('.', ',');
                        }
                        lineasCSV.push(`"${mercadoFormateado}";"${seleccion}";"${cuota}"`);
                    }
                });
            });

            if (lineasCSV.length <= 1) {
                alert("❌ No se extrajeron datos. Comprueba la página.");
                return;
            }

            const ahora = new Date();
            const timestamp = `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}_${ahora.getHours().toString().padStart(2, '0')}-${ahora.getMinutes().toString().padStart(2, '0')}`;

            // Generar descarga asegurando UTF-8 con BOM para que tu Sheets en España no rompa las tildes
            const contenidoCSV = "\uFEFF" + lineasCSV.join("\n");
            const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            
            link.href = URL.createObjectURL(blob);
            link.download = `pinnacle_estructurado_fijo_${timestamp}.csv`;
            link.click();
            
            console.log(`✅ ¡Proceso completado! Mapeo estructural 100% fiel al HTML.`);
        }, 600); 

    }, 200);
})();
