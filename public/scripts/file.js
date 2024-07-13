import { showNotification } from './main.js';

async function loadFile(filePath) {
    try {
        const response = await fetch(`/api/file?file=${encodeURIComponent(filePath)}`);
        if (!response.ok) {
            throw new Error('ファイルの読み込みに失敗しました');
        }
        const file = await response.json();
        const fileContent = document.querySelector('#file-content pre');
        fileContent.textContent = file.content;
        document.querySelector('#copy-button').setAttribute('data-current-file', filePath);
    } catch (error) {
        alert('ファイルの読み込みに失敗しました: ' + error.message);
    }
}

export { loadFile };
