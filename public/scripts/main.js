import { loadDirectory } from './directory.js';
import { loadFile } from './file.js';
import { copyCurrentFileContent, copyAllContent, copyDirectoryStructure } from './clipboard.js';
import { initializeHighlight } from './highlight.js';

const clipboard = new ClipboardJS('#copy-button');

$(document).ready(function() {
    function scrollToRight(element) {
        setTimeout(() => {
            element.scrollLeft = element.scrollWidth;
        }, 0);
    }

    const dirPathInput = document.getElementById('directory-path');
    scrollToRight(dirPathInput);

    $('#directory-path').on('input', function() {
        scrollToRight(this);
    });

    $('#directory-path').on('focus', function() {
        scrollToRight(this);
    });

    $('#directory-path').on('blur', function() {
        scrollToRight(this);
    });

    $('#directory-path').on('click', function() {
        const val = $(this).val();
        $(this).focus();
        setTimeout(() => {
            $(this)[0].setSelectionRange(val.length, val.length);
        }, 0);
    });

    $('#copy-all-button').on('click', function() {
        copyAllContent();
    });

    $('#copy-button').on('click', function() {
        copyCurrentFileContent();
    });

    $('#copy-structure-button').on('click', function() {
        copyDirectoryStructure();
    });

    clipboard.on('success', function(e) {
        showNotification('コピーが成功しました');
    });

    // ハイライト機能の初期化
    initializeHighlight();
});

function showNotification(message) {
    const notification = $('<div class="notification">' + message + '</div>');
    $('body').append(notification);
    setTimeout(() => {
        notification.fadeOut(1000, () => {
            notification.remove();
        });
    }, 1000);
}

export { showNotification };
