const maxSize = 1 * 1024 * 1024;

document.addEventListener('DOMContentLoaded', () => {
    maxSizeDisplay.textContent = `${maxSize / 1024 / 1024} MB`;
});

function getStoredFiles() {
    return JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
}

function saveStoredFiles(files) {
    try {
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Storage limit reached! Cannot save more files.');
            throw e;
        }
    }
}

function addFile(file) {
    const files = getStoredFiles();
    files.push(file);
    saveStoredFiles(files);
}

function deleteFile(id) {
    let files = getStoredFiles();
    files = files.filter(file => file.id !== id);
    saveStoredFiles(files);
    updateFileList();
}

function updateFileList() {
    const fileListDiv = document.getElementById('fileList');
    const files = getStoredFiles();
    fileListDiv.innerHTML = '';

    if (files.length === 0) {
        fileListDiv.innerHTML = '<p style="opacity:70%">No files saved here... Upload some using the button above!</p>';
        return;
    }

    for (const file of files) {
        const container = document.createElement('div');
        container.className = 'file-container';

        const title = document.createElement('p');
        title.textContent = file.name;
        title.className = 'file-title';
        container.appendChild(title);

        if (file.type.startsWith('image')) {
            const img = document.createElement('img');
            img.src = file.data;
            container.appendChild(img);
        }

        const downloadLink = document.createElement('a');
        downloadLink.href = file.data;
        downloadLink.download = file.name;
        downloadLink.textContent = 'Download';
        container.appendChild(downloadLink);

        const delButton = document.createElement('button');
        delButton.textContent = 'Delete';
        delButton.onclick = () => deleteFile(file.id);
        container.appendChild(delButton);

        fileListDiv.appendChild(container);
    }
}

document.getElementById('fileInput').addEventListener('change', event => {
    for (const file of event.target.files) {
        if (file.size > maxSize) {
            alert(`File "${file.name}" is too large. Maximum allowed size is 1MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = evt => {
            const fileObj = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                data: evt.target.result,
            };
            try {
                addFile(fileObj);
                updateFileList();
            } catch (e) {
                console.error('Failed to store file:', e);
            }
        };
        reader.readAsDataURL(file);
    }
    event.target.value = '';
});

updateFileList();