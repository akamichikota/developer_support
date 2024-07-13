import { loadFile } from './file.js';
import { showNotification } from './main.js';
import { addCopyIcons } from './clipboard.js';

async function loadDirectory() {
    const dirPath = document.getElementById('directory-path').value;
    if (!dirPath) {
        alert('ディレクトリパスを入力してください');
        return;
    }
    try {
        const response = await fetch(`/api/files?dir=${encodeURIComponent(dirPath)}`);
        if (!response.ok) {
            throw new Error('ディレクトリの読み込みに失敗しました');
        }
        const files = await response.json();

        $('#file-tree').jstree("destroy").empty();
        $('#file-tree').jstree({
            'core': {
                'data': files,
                'themes': {
                    'icons': true
                },
                'check_callback': true
            },
            'plugins': ['themes', 'html_data', 'state']
        });

        $('#file-tree').on('select_node.jstree', function (e, data) {
            const filePath = data.node.id;
            if (data.node.icon && data.node.icon.includes('jstree-folder')) {
                return;
            }
            loadFile(filePath);
        });

        $('#file-tree').on('click.jstree', '.jstree-anchor', function (e) {
            const instance = $.jstree.reference(this);
            const node = instance.get_node(this);
            if (node.icon && node.icon.includes('jstree-folder')) {
                instance.toggle_node(node);
            }
        });

        $('#file-tree').on('ready.jstree', addCopyIcons);
        $('#file-tree').on('open_node.jstree', addCopyIcons);

    } catch (error) {
        alert('ディレクトリの読み込みに失敗しました: ' + error.message);
    }
}

export { loadDirectory };
