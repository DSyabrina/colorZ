document.addEventListener('DOMContentLoaded', () => {
    const colorBoxes = document.querySelectorAll('.color-box');
    const imageInput = document.getElementById('imageInput');
    const saveBtn = document.getElementById('saveBtn');

    // Generate random color in hex 
    function generateRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Generate random palette
    function generatePalette() {
        colorBoxes.forEach(box => {
            const color = generateRandomColor();
            const displayDiv = box.querySelector('.color-display');
            const hexSpan = box.querySelector('.hex-code');
            
            displayDiv.style.backgroundColor = color;
            hexSpan.textContent = color;
        });
    }

    // Copy color
    function setupColorCopy() {
        colorBoxes.forEach(box => {
            const colorCodeBtn = box.querySelector('.color-code');
            const hexSpan = box.querySelector('.hex-code');

            colorCodeBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(hexSpan.textContent);
                    colorCodeBtn.classList.add('copied');
                    
                    // Remove copied class after animation
                    setTimeout(() => {
                        colorCodeBtn.classList.remove('copied');
                    }, 1500);
                } catch (err) {
                    console.error('Failed to copy color code:', err);
                }
            });
        });
    }

    // image upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const colors = extractColors(canvas, ctx, 5);
                    colors.forEach((color, index) => {
                        if (colorBoxes[index]) {
                            const displayDiv = colorBoxes[index].querySelector('.color-display');
                            const hexSpan = colorBoxes[index].querySelector('.hex-code');
                            displayDiv.style.backgroundColor = color;
                            hexSpan.textContent = color;
                        }
                    });
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    }

    // Extract from image
    function extractColors(canvas, ctx, colorCount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap = new Map();
        
        for (let i = 0; i < imageData.length; i += 4) {
            const color = rgbToHex(imageData[i], imageData[i + 1], imageData[i + 2]);
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
        
        return Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorCount)
            .map(entry => entry[0]);
    }

    // RGB to HEX
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Save
    function savePalette() {
        html2canvas(document.querySelector('.palette-container')).then(canvas => {
            const link = document.createElement('a');
            link.download = 'color-palette.jpg';
            link.href = canvas.toDataURL('image/jpeg');
            link.click();
        });
    }

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generatePalette();
        }
    });

    imageInput.addEventListener('change', handleImageUpload);
    saveBtn.addEventListener('click', savePalette);

    generatePalette();
    setupColorCopy();
});