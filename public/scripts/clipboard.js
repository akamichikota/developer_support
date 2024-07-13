import { showNotification } from './main.js';

async function copyFileContent(filePath, useParentDirectory = false) {
    try {
        const response = await fetch(`/api/file?file=${encodeURIComponent(filePath)}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ファイルの読み込みに失敗しました: ${errorText}`);
        }
        const file = await response.json();
        const codeContent = file.content;
        const rootPath = document.getElementById('directory-path').value;
        const relativePath = filePath.replace(rootPath, '').replace(/\\/g, '/').replace(/^\//, '');
        const parentDirectory = filePath.split(/[\/\\]/).slice(0, -1).join('/');
        const directoryPath = useParentDirectory ? parentDirectory : rootPath;
        const markdownContent = `## Directory Path\n\`\`\`\n${directoryPath}\n\`\`\`\n\n## File: ${filePath}\n\`\`\`\n${codeContent}\n\`\`\`\n`;

        navigator.clipboard.writeText(markdownContent)
            .then(() => {
                showNotification('ファイルがコピーされました');
            })
            .catch(err => {
                alert('コピーに失敗しました: ' + err.message);
            });
    } catch (error) {
        alert('ファイルの読み込みに失敗しました: ' + error.message);
    }
}

async function copyFolderContent(folderPath, isRoot = false) {
    try {
        const response = await fetch(`/api/files?dir=${encodeURIComponent(folderPath)}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`フォルダの内容の読み込みに失敗しました: ${errorText}`);
        }
        const files = await response.json();
        let combinedContent = '';
        const rootPath = isRoot ? folderPath : document.getElementById('directory-path').value;

        for (const file of files) {
            if (file.icon === 'jstree-folder') {
                combinedContent += await getFolderContent(file.id, rootPath);
            } else {
                combinedContent += await getFileContent(file.id, rootPath, isRoot);
            }
        }

        const markdownContent = `## Directory Path\n\`\`\`\n${folderPath}\n\`\`\`\n\n${combinedContent}`;

        navigator.clipboard.writeText(markdownContent)
            .then(() => {
                showNotification('フォルダがコピーされました');
            })
            .catch(err => {
                alert('コピーに失敗しました: ' + err.message);
            });
    } catch (error) {
        alert('フォルダの内容の読み込みに失敗しました: ' + error.message);
    }
}

async function getFolderContent(folderPath, rootPath) {
    try {
        const response = await fetch(`/api/files?dir=${encodeURIComponent(folderPath)}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`フォルダの内容の読み込みに失敗しました: ${errorText}`);
        }
        const files = await response.json();
        let folderContent = '';

        for (const file of files) {
            if (file.icon === 'jstree-folder') {
                folderContent += await getFolderContent(file.id, rootPath);
            } else {
                folderContent += await getFileContent(file.id, rootPath, false);
            }
        }

        return folderContent;
    } catch (error) {
        throw new Error('フォルダの読み込みに失敗しました: ' + error.message);
    }
}

async function getFileContent(filePath, rootPath, isRoot) {
    try {
        const response = await fetch(`/api/file?file=${encodeURIComponent(filePath)}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ファイルの読み込みに失敗しました: ${errorText}`);
        }
        const fileData = await response.json();
        const relativePath = filePath.replace(rootPath, '').replace(/\\/g, '/').replace(/^\//, '');
        const folderPath = rootPath.endsWith('/') ? rootPath : rootPath + '/';
        const relativeToRoot = filePath.replace(folderPath, '').replace(/\\/g, '/');

        return `## File: ${relativeToRoot}\n\`\`\`\n${fileData.content}\n\`\`\`\n\n`;
    } catch (error) {
        throw new Error('ファイルの読み込みに失敗しました: ' + error.message);
    }
}

async function copyCurrentFileContent() {
    const currentFilePath = document.querySelector('#copy-button').getAttribute('data-current-file');
    if (currentFilePath) {
        await copyFileContent(currentFilePath, true);
    } else {
        alert('コピーするファイルが選択されていません');
    }
}

async function copyAllContent() {
    const dirPath = document.getElementById('directory-path').value;
    if (!dirPath) {
        alert('ディレクトリパスを入力してください');
        return;
    }
    await copyFolderContent(dirPath, true);
}

async function copyDirectoryStructure() {
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
        let structure = '';
        
        function buildStructure(nodes, indent = '') {
            nodes.forEach(node => {
                if (node.icon === 'jstree-folder') {
                    structure += `${indent}- ${node.text}\n`;
                    buildStructure(files.filter(file => file.parent === node.id), indent + '  ');
                } else {
                    structure += `${indent}- ${node.text}\n`;
                }
            });
        }

        buildStructure(files.filter(file => file.parent === '#'));

        const markdownContent = `## Directory Structure\n\`\`\`\n${structure}\`\`\`\n`;

        navigator.clipboard.writeText(markdownContent)
            .then(() => {
                showNotification('ディレクトリ構造がコピーされました');
            })
            .catch(err => {
                alert('コピーに失敗しました: ' + err.message);
            });
    } catch (error) {
        alert('ディレクトリ構造の読み込みに失敗しました: ' + error.message);
    }
}

function addCopyIcons() {
    $('#file-tree .jstree-node').each(function () {
        const node = $(this);
        const filePath = node.attr('id');
        const isFolder = node.find('.jstree-anchor > i').hasClass('jstree-folder');

        if (isFolder && node.find('.copy-folder-icon').length === 0) {
            node.find('.copy-file-icon').remove();
            node.find('a').append('<span class="copy-icon-wrapper"><span class="copy-folder-icon">📁</span></span>');
        }

        if (!isFolder && node.find('.copy-file-icon').length === 0) {
            node.find('.copy-folder-icon').remove();
            node.find('a').append('<span class="copy-icon-wrapper"><span class="copy-file-icon">📋</span></span>');
        }
    });

    if (!$('.copy-file-icon').data('bound')) {
        $(document).on('click', '.copy-file-icon', async function (e) {
            e.stopPropagation();
            const filePath = $(this).closest('.jstree-node').attr('id');
            await copyFileContent(filePath, true);
        }).data('bound', true);
    }

    if (!$('.copy-folder-icon').data('bound')) {
        $(document).on('mousedown', '.copy-folder-icon', function (e) {
            e.stopPropagation();
        });
        $(document).on('click', '.copy-folder-icon', async function (e) {
            e.stopPropagation();
            const folderPath = $(this).closest('.jstree-node').attr('id');
            await copyFolderContent(folderPath);
        }).data('bound', true);
    }
}

export { copyCurrentFileContent, copyAllContent, copyDirectoryStructure, addCopyIcons };
