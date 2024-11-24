// Elements
const encodeOption = document.getElementById('encode-option');
const decodeOption = document.getElementById('decode-option');
const encodeSection = document.getElementById('encode-section');
const decodeSection = document.getElementById('decode-section');
const inputText = document.getElementById('input-text');
const encodeButton = document.getElementById('encode-button');
const downloadButton = document.getElementById('download-button');
const fileInput = document.getElementById('file-input');
const decodeButton = document.getElementById('decode-button');
const decodedMessage = document.getElementById('decoded-message');
const outputCanvas = document.getElementById('output-canvas');
const ctx = outputCanvas.getContext('2d');
// Elements
// Elements
// Elements
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Check local storage for theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

// Event listener for dark mode toggle button
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Save theme preference to local storage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});



// Random image URL (free-to-use image)
const randomImageURL = 'https://picsum.photos/500'; // Change dimensions if needed

// Switch to encoding section
encodeOption.addEventListener('click', () => {
    encodeSection.style.display = 'block';
    decodeSection.style.display = 'none';
});

// Switch to decoding section
decodeOption.addEventListener('click', () => {
    decodeSection.style.display = 'block';
    encodeSection.style.display = 'none';
});

// Function to encode text into an image
function encodeTextInImage(image, text) {
    // Set canvas dimensions to match the image
    outputCanvas.width = image.width;
    outputCanvas.height = image.height;

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // Convert text to binary and pad with null characters
    const binaryText = Array.from(text).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('') + '00000000';
    let textIndex = 0;

    // Encode text into pixel data (altering the red channel's least significant bit)
    for (let i = 0; i < data.length && textIndex < binaryText.length; i += 4) {
        // Modify the red channel's least significant bit
        data[i] = (data[i] & 0xFE) | parseInt(binaryText[textIndex]);
        textIndex++;
    }

    // Update canvas with modified data
    ctx.putImageData(imageData, 0, 0);

    // Display the download button
    downloadButton.style.display = 'inline-block';
}

// Function to decode hidden text from an image
function decodeTextFromImage() {
    const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = imageData.data;
    let binaryText = '';
    let charCode;
    let decodedText = '';

    // Extract binary text from the red channel's least significant bits
    for (let i = 0; i < data.length; i += 4) {
        binaryText += (data[i] & 1).toString(); // Get LSB of the red channel
        if (binaryText.length === 8) {
            charCode = parseInt(binaryText, 2);
            if (charCode === 0) break; // Stop at null character
            decodedText += String.fromCharCode(charCode);
            binaryText = '';
        }
    }

    decodedMessage.textContent = decodedText || 'No hidden message found.';
}

// Event listener for the encode button
encodeButton.addEventListener('click', () => {
    const text = inputText.value;
    if (text.trim() === '') {
        alert('Please enter a message to encode.');
        return;
    }

    // Load a random image
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Enable cross-origin for external images
    img.src = randomImageURL;

    img.onload = () => {
        encodeTextInImage(img, text);
    };

    img.onerror = () => {
        alert('Failed to load the image.');
    };
});

// Event listener for the download button
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'encoded-image.png';
    link.href = outputCanvas.toDataURL('image/png');
    link.click();
});

// Event listener for the decode button
decodeButton.addEventListener('click', () => {
    if (!fileInput.files.length) {
        alert('Please select an image file to decode.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
            // Set canvas dimensions to match the image
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);

            // Decode text from the image
            decodeTextFromImage();
        };

        img.onerror = () => {
            alert('Failed to load the image.');
        };
    };

    reader.readAsDataURL(file);
});
