// Canvas and state management
const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');
let currentImage = null;
let currentMode = 'classic'; // 'classic' or 'free'
let fontSize = 48;
let freeTexts = []; // Array of {text: string, x: number, y: number, id: number}
let draggingText = null;
let nextTextId = 0;

// DOM elements
const templateSelect = document.getElementById('template-select');
const topTextInput = document.getElementById('top-text');
const bottomTextInput = document.getElementById('bottom-text');
const freeTextInput = document.getElementById('free-text');
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const downloadBtn = document.getElementById('download-btn');
const classicModeBtn = document.getElementById('classic-mode-btn');
const freeModeBtn = document.getElementById('free-mode-btn');
const addTextBtn = document.getElementById('add-text-btn');
const classicControls = document.getElementById('classic-controls');
const freeControls = document.getElementById('free-controls');
const textList = document.getElementById('text-list');

// Meme templates
const templates = {
    drake: 'templates/drake.jpeg',
    distracted: 'templates/distracted.jpeg',
    buttons: 'templates/buttons.jpeg',
    simply: 'templates/simply.jpeg',
    success: 'templates/success.jpeg'
};

// Initialize canvas
function initCanvas() {
    canvas.width = 600;
    canvas.height = 600;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#999';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Select a template to get started', canvas.width / 2, canvas.height / 2);
}

// Load and draw image
function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        currentImage = img;
        // Set canvas to display at a good size (maintaining aspect ratio)
        // These dimensions will make memes appear at a nice size
        const targetWidth = 600;
        const targetHeight = 600;
        let width = img.width;
        let height = img.height;
        
        // Scale to fit within target dimensions while maintaining aspect ratio
        const scale = Math.min(targetWidth / width, targetHeight / height);
        width = width * scale;
        height = height * scale;
        
        canvas.width = width;
        canvas.height = height;
        drawMeme();
    };
    img.onerror = function() {
        alert('Failed to load image. Using placeholder instead.');
        createPlaceholderImage(src);
    };
    img.src = src;
}

// Create placeholder image if actual image fails to load
function createPlaceholderImage(templateName) {
    canvas.width = 600;
    canvas.height = 600;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4a5568');
    gradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = '#cbd5e0';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Meme Template', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(templateName.split('/')[1].replace('.jpg', '').toUpperCase(), canvas.width / 2, canvas.height / 2 + 20);
    
    // Create a dummy image object
    currentImage = new Image();
    currentImage.width = canvas.width;
    currentImage.height = canvas.height;
    currentImage.src = canvas.toDataURL();
    
    drawMeme();
}

// Draw text with outline
function drawText(text, x, y, size = fontSize) {
    if (!text) return;
    
    ctx.font = `bold ${size}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Convert to uppercase for classic meme style
    text = text.toUpperCase();
    
    // Black outline (stroke)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = size / 16; // Proportional to font size
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    
    // White fill
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

// Draw the complete meme
function drawMeme() {
    if (!currentImage) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    if (currentMode === 'classic') {
        // Draw top text
        if (topTextInput.value) {
            drawText(topTextInput.value, canvas.width / 2, fontSize);
        }
        
        // Draw bottom text
        if (bottomTextInput.value) {
            drawText(bottomTextInput.value, canvas.width / 2, canvas.height - fontSize);
        }
    } else if (currentMode === 'free') {
        // Draw all free-positioned texts
        freeTexts.forEach(textObj => {
            drawText(textObj.text, textObj.x, textObj.y, fontSize);
        });
    }
}

// Event Listeners
templateSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        loadImage(templates[e.target.value]);
    }
});

topTextInput.addEventListener('input', drawMeme);
bottomTextInput.addEventListener('input', drawMeme);

fontSizeSlider.addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = fontSize;
    drawMeme();
});

// Mode switching
classicModeBtn.addEventListener('click', () => {
    currentMode = 'classic';
    classicModeBtn.classList.add('active');
    freeModeBtn.classList.remove('active');
    classicControls.style.display = 'block';
    freeControls.style.display = 'none';
    canvas.classList.add('classic-mode');
    drawMeme();
});

freeModeBtn.addEventListener('click', () => {
    currentMode = 'free';
    freeModeBtn.classList.add('active');
    classicModeBtn.classList.remove('active');
    classicControls.style.display = 'none';
    freeControls.style.display = 'block';
    canvas.classList.remove('classic-mode');
    drawMeme();
});

// Free mode: Add text
addTextBtn.addEventListener('click', () => {
    const text = freeTextInput.value.trim();
    if (text) {
        const textObj = {
            id: nextTextId++,
            text: text,
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        freeTexts.push(textObj);
        freeTextInput.value = '';
        updateTextList();
        drawMeme();
    }
});

// Update text list in UI
function updateTextList() {
    textList.innerHTML = '';
    freeTexts.forEach((textObj, index) => {
        const item = document.createElement('div');
        item.className = 'text-item';
        item.innerHTML = `
            <span>${textObj.text}</span>
            <button onclick="removeText(${textObj.id})">Remove</button>
        `;
        textList.appendChild(item);
    });
}

// Remove text from free mode
window.removeText = function(id) {
    freeTexts = freeTexts.filter(t => t.id !== id);
    updateTextList();
    drawMeme();
};

// Canvas mouse events for dragging text in free mode
let mouseOffset = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    if (currentMode !== 'free' || !currentImage) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Check if clicked on any text
    for (let i = freeTexts.length - 1; i >= 0; i--) {
        const textObj = freeTexts[i];
        ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
        const metrics = ctx.measureText(textObj.text.toUpperCase());
        const textWidth = metrics.width;
        const textHeight = fontSize;
        
        if (mouseX >= textObj.x - textWidth / 2 && mouseX <= textObj.x + textWidth / 2 &&
            mouseY >= textObj.y - textHeight / 2 && mouseY <= textObj.y + textHeight / 2) {
            draggingText = textObj;
            mouseOffset.x = mouseX - textObj.x;
            mouseOffset.y = mouseY - textObj.y;
            canvas.style.cursor = 'grabbing';
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (currentMode !== 'free' || !draggingText) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    draggingText.x = mouseX - mouseOffset.x;
    draggingText.y = mouseY - mouseOffset.y;
    
    drawMeme();
});

canvas.addEventListener('mouseup', () => {
    if (draggingText) {
        draggingText = null;
        canvas.style.cursor = 'crosshair';
    }
});

canvas.addEventListener('mouseleave', () => {
    if (draggingText) {
        draggingText = null;
        canvas.style.cursor = 'crosshair';
    }
});

// Download meme
downloadBtn.addEventListener('click', () => {
    if (!currentImage) {
        alert('Please select a template first!');
        return;
    }
    
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meme-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
});

// Initialize
initCanvas();


