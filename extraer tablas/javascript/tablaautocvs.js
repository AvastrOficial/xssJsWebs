(async function descargarTodasLasPaginas() {
    const tablaId = 'general';
    const delay = 2000; // ms entre páginas (ajusta según velocidad de carga)
    let todasLasFilas = [];
    let paginaActual = 1;
    let encabezados = [];
    
    // Función para extraer filas de la página actual
    function extraerFilasActuales() {
        const tabla = document.querySelector(`table#${tablaId}`);
        if (!tabla) return [];
        
        const filas = [];
        const trs = tabla.querySelectorAll('tbody tr');
        
        trs.forEach(tr => {
            const celdas = [];
            const tds = tr.querySelectorAll('td');
            tds.forEach(td => {
                let texto = td.innerText.trim().replace(/\s+/g, ' ');
                celdas.push(`"${texto.replace(/"/g, '""')}"`);
            });
            if (celdas.length > 0) filas.push(celdas.join(','));
        });
        
        return filas;
    }
    
    // Función para obtener encabezados (solo una vez)
    function obtenerEncabezados() {
        const tabla = document.querySelector(`table#${tablaId}`);
        if (!tabla) return [];
        
        const headers = [];
        const ths = tabla.querySelectorAll('thead th');
        ths.forEach(th => {
            let texto = th.innerText.trim().replace(/activate to sort column.*$/, '');
            if (texto) headers.push(`"${texto.replace(/"/g, '""')}"`);
        });
        return headers;
    }
    
    // Función para ir a la siguiente página
    function irSiguientePagina() {
        // Buscar botón de siguiente en DataTables
        const botones = document.querySelectorAll('.paginate_button');
        for (let btn of botones) {
            const texto = btn.innerText.trim().toLowerCase();
            if (texto === 'siguiente' || texto === 'next' || texto === '›' || texto === '»') {
                if (!btn.disabled && !btn.classList.contains('disabled')) {
                    btn.click();
                    return true;
                }
            }
        }
        return false;
    }
    
    // Función para verificar si hay más páginas
    function haySiguientePagina() {
        const infoTexto = document.querySelector('.dataTables_info')?.innerText || '';
        const match = infoTexto.match(/de\s+(\d+)/i);
        const totalRegistros = match ? parseInt(match[1]) : 0;
        
        const paginaInfo = document.querySelector('.paginate_button.current')?.innerText;
        const paginaActualNum = paginaInfo ? parseInt(paginaInfo) : 1;
        
        const totalPaginas = Math.ceil(totalRegistros / 10); // Asumiendo 10 por página
        return paginaActualNum < totalPaginas;
    }
    
    // Obtener encabezados
    encabezados = obtenerEncabezados();
    if (encabezados.length === 0) {
        console.error('❌ No se encontró la tabla');
        return;
    }
    
    console.log('🚀 Iniciando descarga de TODAS las páginas...');
    
    // Extraer primera página
    let filasPagina = extraerFilasActuales();
    todasLasFilas.push(...filasPagina);
    console.log(`📄 Página ${paginaActual}: ${filasPagina.length} filas (Total: ${todasLasFilas.length})`);
    
    // Iterar por todas las páginas
    while (haySiguientePagina()) {
        console.log(`⏳ Yendo a página ${paginaActual + 1}...`);
        
        if (!irSiguientePagina()) {
            console.log('⚠️ No se pudo avanzar a la siguiente página');
            break;
        }
        
        // Esperar que cargue
        await new Promise(resolve => setTimeout(resolve, delay));
        
        paginaActual++;
        filasPagina = extraerFilasActuales();
        todasLasFilas.push(...filasPagina);
        console.log(`📄 Página ${paginaActual}: ${filasPagina.length} filas (Total: ${todasLasFilas.length})`);
        
        // Seguridad: límite de páginas
        if (paginaActual > 100) break;
    }
    
    // Generar CSV
    console.log(`📊 Total de filas extraídas: ${todasLasFilas.length}`);
    
    const csvContent = [encabezados.join(','), ...todasLasFilas].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tabla_completa_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    console.log(`✅ DESCARGA FINALIZADA! ${todasLasFilas.length} filas en total`);
})();
