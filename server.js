const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

function readDirectoryRecursive(dirPath) {
    const result = [];
    function readDir(currentPath, parentPath) {
        const items = fs.readdirSync(currentPath, { withFileTypes: true });
        items.forEach(item => {
            const itemPath = path.join(currentPath, item.name);
            const itemNode = {
                id: itemPath,
                parent: parentPath,
                text: item.name,
                icon: item.isDirectory() ? 'jstree-folder' : 'jstree-file'
            };
            result.push(itemNode);
            if (item.isDirectory()) {
                readDir(itemPath, itemPath);
            }
        });
    }
    readDir(dirPath, '#');
    return result;
}

app.get('/api/files', (req, res) => {
    const dirPath = decodeURIComponent(req.query.dir);
    if (!dirPath) {
        return res.status(400).json({ error: 'ディレクトリパスが必要です' });
    }
    try {
        const safePath = path.resolve(dirPath);
        if (!fs.existsSync(safePath)) {
            return res.status(400).json({ error: '指定されたディレクトリは存在しません' });
        }
        const fileTree = readDirectoryRecursive(safePath);
        res.json(fileTree);
    } catch (err) {
        res.status(500).json({ error: 'ディレクトリの読み込みに失敗しました', details: err.message });
    }
});

app.get('/api/file', (req, res) => {
    const filePath = decodeURIComponent(req.query.file);
    if (!filePath) {
        return res.status(400).json({ error: 'ファイルパスが必要です' });
    }
    const safeFilePath = path.resolve(filePath);
    if (!fs.existsSync(safeFilePath)) {
        return res.status(400).json({ error: '指定されたファイルは存在しません' });
    }
    fs.readFile(safeFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'ファイルの読み込みに失敗しました', details: err.message });
        }
        res.json({ content: data });
    });
});

app.listen(PORT, () => {
    console.log(`サーバーがhttp://localhost:${PORT}で起動しました`);
});
