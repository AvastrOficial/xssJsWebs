(function(){
    const tabla = document.querySelector('table.table-bordered');
    const headers = Array.from(tabla.querySelectorAll('thead th')).map(th => `"${(th.querySelector('label')?.innerText.trim() || th.innerText.trim()).replace(/"/g,'""')}"`);
    const filas = Array.from(tabla.querySelectorAll('tbody tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => `"${td.innerText.trim().replace(/"/g,'""')}"`).join(','));
    const csv = [headers.join(','), ...filas].join('\n');
    const blob = new Blob(["\uFEFF" + csv], {type: 'text/csv'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tabla_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
})();
