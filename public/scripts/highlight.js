function initializeHighlight() {
    $('#file-tree').on('dblclick', '.jstree-anchor', function (e) {
        const node = $(this).closest('.jstree-node');
        node.toggleClass('highlight');
    });
}

export { initializeHighlight };
