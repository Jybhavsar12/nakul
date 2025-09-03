class SteganographyTool {
    constructor() {
        this.initializeEventListeners();
        this.hideImageData = null;
        this.extractImageData = null;
        this.initializeParticles();
        this.initializeNotifications();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.textContent.toLowerCase().includes('hide') ? 'hide' : 'extract';
                this.showTab(tab);
            });
        });

        // Hide tab dropzone
        const hideDropzone = document.getElementById('hide-dropzone');
        const hideFileInput = document.getElementById('hide-file-input');
        
        hideDropzone.addEventListener('click', () => hideFileInput.click());
        hideDropzone.addEventListener('dragover', this.handleDragOver);
        hideDropzone.addEventListener('dragleave', this.handleDragLeave);
        hideDropzone.addEventListener('drop', (e) => this.handleFileDrop(e, 'hide'));
        hideFileInput.addEventListener('change', (e) => this.handleFileSelect(e, 'hide'));

        // Extract tab dropzone
        const extractDropzone = document.getElementById('extract-dropzone');
        const extractFileInput = document.getElementById('extract-file-input');
        
        extractDropzone.addEventListener('click', () => extractFileInput.click());
        extractDropzone.addEventListener('dragover', this.handleDragOver);
        extractDropzone.addEventListener('dragleave', this.handleDragLeave);
        extractDropzone.addEventListener('drop', (e) => this.handleFileDrop(e, 'extract'));
        extractFileInput.addEventListener('change', (e) => this.handleFileSelect(e, 'extract'));

        // Action buttons
        document.getElementById('hide-btn').addEventListener('click', () => this.hideMessage());
        document.getElementById('extract-btn').addEventListener('click', () => this.extractMessage());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadImage());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyMessage());

        // Message input
        const messageInput = document.getElementById('secret-message');
        messageInput.addEventListener('input', () => {
            this.updateCharCounter();
            this.updateHideButton();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                const activeTab = document.querySelector('.tab-content.active');
                if (activeTab.id === 'hide-tab') {
                    this.hideMessage();
                } else {
                    this.extractMessage();
                }
            }
        });
    }

    initializeParticles() {
        const particlesContainer = document.querySelector('.particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: var(--primary-color);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                box-shadow: 0 0 10px var(--primary-color);
            `;
            particlesContainer.appendChild(particle);
        }
    }

    initializeNotifications() {
        this.notificationContainer = document.getElementById('notifications');
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    showTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        this.showNotification(`Switched to ${tab} mode`, 'info', 2000);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleFileDrop(e, type) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0], type);
        }
    }

    handleFileSelect(e, type) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file, type);
        }
    }

    processFile(file, type) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 10MB', 'error');
            return;
        }

        this.showNotification(`Loading ${file.name}...`, 'info', 2000);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                if (type === 'hide') {
                    this.hideImageData = imageData;
                    this.updateDropzoneText('hide-dropzone', `✅ ${file.name} loaded (${img.width}x${img.height})`);
                    this.updateHideButton();
                    this.showNotification('Image loaded successfully!', 'success');
                } else {
                    this.extractImageData = imageData;
                    this.updateDropzoneText('extract-dropzone', `✅ ${file.name} loaded (${img.width}x${img.height})`);
                    document.getElementById('extract-btn').disabled = false;
                    this.showNotification('Steganographic image loaded!', 'success');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateDropzoneText(dropzoneId, text) {
        const dropzone = document.getElementById(dropzoneId);
        dropzone.querySelector('.dropzone-text').textContent = text;
    }

    updateCharCounter() {
        const message = document.getElementById('secret-message').value;
        const counter = document.getElementById('char-count');
        counter.textContent = message.length;
        
        if (message.length > 8000) {
            counter.style.color = 'var(--accent-color)';
        } else {
            counter.style.color = 'var(--primary-color)';
        }
    }

    updateHideButton() {
        const message = document.getElementById('secret-message').value.trim();
        const hasImage = this.hideImageData !== null;
        const btn = document.getElementById('hide-btn');
        btn.disabled = !(hasImage && message);
        
        if (hasImage && message) {
            btn.style.animation = 'pulse 2s infinite';
        } else {
            btn.style.animation = 'none';
        }
    }

    hideMessage() {
        const message = document.getElementById('secret-message').value.trim();
        if (!message || !this.hideImageData) return;

        this.showAdvancedLoading('hide');

        setTimeout(() => {
            try {
                const modifiedImageData = this.embedMessage(this.hideImageData, message);
                this.displayResult(modifiedImageData);
                this.showLoading(false);
                this.showNotification('Message hidden successfully! 🎉', 'success');
            } catch (error) {
                this.showNotification('Error hiding message: ' + error.message, 'error');
                this.showLoading(false);
            }
        }, 2000);
    }

    extractMessage() {
        if (!this.extractImageData) return;

        this.showAdvancedLoading('extract');

        setTimeout(() => {
            try {
                const message = this.extractMessageFromImage(this.extractImageData);
                this.displayExtractedMessage(message);
                this.showLoading(false);
                if (message !== 'No hidden message found') {
                    this.showNotification('Secret message extracted! 🔓', 'success');
                } else {
                    this.showNotification('No hidden message found', 'error');
                }
            } catch (error) {
                this.showNotification('Error extracting message: ' + error.message, 'error');
                this.showLoading(false);
            }
        }, 2000);
    }

    showAdvancedLoading(type) {
        this.showLoading(true);
        const steps = document.querySelectorAll('.step');
        const messages = type === 'hide' ? 
            ['Analyzing image structure...', 'Encoding message...', 'Applying steganography...', 'Finalizing output...'] :
            ['Scanning for hidden data...', 'Decoding message...', 'Verifying integrity...', 'Extracting content...'];
        
        steps.forEach((step, index) => {
            step.textContent = messages[index];
            step.classList.remove('active');
        });

        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(stepInterval);
            }
        }, 500);
    }

    embedMessage(imageData, message) {
        const data = new Uint8ClampedArray(imageData.data);
        const messageBytes = new TextEncoder().encode(message);
        const messageLength = messageBytes.length;

        // Check if image is large enough
        const totalBits = (messageLength * 8) + 32; // 32 bits for length
        const availableBits = data.length; // Each byte can store 1 bit
        
        if (totalBits > availableBits) {
            throw new Error(`Message too long! Need ${totalBits} bits but only ${availableBits} available.`);
        }

        let bitIndex = 0;

        // Embed message length (32 bits)
        for (let i = 0; i < 32; i++) {
            const bit = (messageLength >> (31 - i)) & 1;
            data[bitIndex] = (data[bitIndex] & 0xFE) | bit;
            bitIndex++;
        }

        // Embed message
        for (let i = 0; i < messageBytes.length; i++) {
            for (let j = 0; j < 8; j++) {
                const bit = (messageBytes[i] >> (7 - j)) & 1;
                data[bitIndex] = (data[bitIndex] & 0xFE) | bit;
                bitIndex++;
            }
        }

        return new ImageData(data, imageData.width, imageData.height);
    }

    extractMessageFromImage(imageData) {
        const data = imageData.data;
        let bitIndex = 0;

        // Extract message length
        let messageLength = 0;
        for (let i = 0; i < 32; i++) {
            const bit = data[bitIndex] & 1;
            messageLength |= (bit << (31 - i));
            bitIndex++;
        }

        if (messageLength <= 0 || messageLength > 10000) {
            return 'No hidden message found';
        }

        // Extract message
        const messageBytes = new Uint8Array(messageLength);
        for (let i = 0; i < messageLength; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                const bit = data[bitIndex] & 1;
                byte |= (bit << (7 - j));
                bitIndex++;
            }
            messageBytes[i] = byte;
        }

        return new TextDecoder().decode(messageBytes);
    }

    displayResult(imageData) {
        const canvas = document.getElementById('output-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        document.getElementById('hide-result').classList.remove('hidden');
        this.resultImageData = imageData;
        
        // Animate result appearance
        const result = document.getElementById('hide-result');
        result.style.animation = 'slideUp 0.5s ease-out';
    }

    displayExtractedMessage(message) {
        const messageElement = document.getElementById('extracted-message');
        messageElement.textContent = '';
        
        // Typewriter effect
        let i = 0;
        const typeWriter = () => {
            if (i < message.length) {
                messageElement.textContent += message.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        document.getElementById('extract-result').classList.remove('hidden');
        setTimeout(typeWriter, 500);
    }

    copyMessage() {
        const message = document.getElementById('extracted-message').textContent;
        navigator.clipboard.writeText(message).then(() => {
            this.showNotification('Message copied to clipboard!', 'success');
            const copyBtn = document.getElementById('copy-btn');
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    }

    downloadImage() {
        const canvas = document.getElementById('output-canvas');
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `steganography_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        this.showNotification('Image downloaded successfully!', 'success');
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }
}

// Global function for tab switching (called from HTML)
function showTab(tab) {
    stegoTool.showTab(tab);
}

// Initialize the tool
const stegoTool = new SteganographyTool();

// Add some extra cyber effects
document.addEventListener('DOMContentLoaded', () => {
    // Add glitch effect to title periodically
    setInterval(() => {
        const title = document.querySelector('.glitch');
        title.style.animation = 'none';
        setTimeout(() => {
            title.style.animation = 'glitch 2s infinite';
        }, 100);
    }, 10000);
    
    // Add random particle effects
    setInterval(() => {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            pointer-events: none;
            z-index: 0;
            animation: floatUp 3s linear forwards;
            box-shadow: 0 0 10px var(--primary-color);
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
    }, 2000);
});

// Add CSS for floating particles
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        to {
            transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
