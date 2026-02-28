document.addEventListener('DOMContentLoaded', () => {
    // API Configuration
    const API_BASE_URL = 'http://localhost:8000';
    const WS_URL = 'ws://localhost:8000/ws/livestream';

    // DOM Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Image Upload Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    // Camera Elements
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('camera-canvas');
    const startCameraBtn = document.getElementById('start-camera-btn');
    const stopCameraBtn = document.getElementById('stop-camera-btn');
    const fpsCounter = document.getElementById('fps-counter');
    
    // Results Elements
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContent = document.getElementById('results-content');
    const emptyState = document.getElementById('empty-state');
    const statusBanner = document.getElementById('status-banner');
    const classificationResult = document.getElementById('classification-result');
    const dangerReason = document.getElementById('danger-reason');
    const captionText = document.getElementById('caption-text');
    const latencyVal = document.getElementById('latency-val');

    // State Variables
    let selectedImageFile = null;
    let cameraStream = null;
    let ws = null;
    let streamInterval = null;
    let frameCount = 0;
    let lastFpsTime = Date.now();
    const FRAME_RATE_MS = 1000; // Send a frame every 1 second (1000ms) to avoid overloading

    // ==========================================
    // Tab Switching Logic
    // ==========================================
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');

            // Reset UI state when switching tabs
            resetResults();

            // Stop camera if switching away from camera tab
            if (targetId !== 'camera-tab' && cameraStream) {
                stopCamera();
            }
        });
    });

    // ==========================================
    // Image Upload Logic
    // ==========================================
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        selectedImageFile = file;
        
        // Setup Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('preview-hidden');
            dropZone.style.display = 'none';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
        
        resetResults();
    }

    analyzeBtn.addEventListener('click', async () => {
        if (!selectedImageFile) return;

        showLoading();
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', selectedImageFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/analyze/image`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Failed to analyze the image. Is the backend running?');
            resetResults();
            analyzeBtn.disabled = false;
        }
    });

    // ==========================================
    // Live Camera Logic (WebSockets)
    // ==========================================
    startCameraBtn.addEventListener('click', async () => {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            video.srcObject = cameraStream;
            
            startCameraBtn.classList.add('hidden');
            stopCameraBtn.classList.remove('hidden');
            resetResults();
            
            // Connect to WebSocket
            connectWebSocket();
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access camera. Please endure permissions are granted.");
        }
    });

    stopCameraBtn.addEventListener('click', stopCamera);

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        video.srcObject = null;
        
        if (ws) {
            ws.close();
        }
        
        if (streamInterval) {
            clearInterval(streamInterval);
        }
        
        startCameraBtn.classList.remove('hidden');
        stopCameraBtn.classList.add('hidden');
        fpsCounter.textContent = '0 FPS';
        resetResults();
    }

    function connectWebSocket() {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('WebSocket Connected');
            // Start capturing frames
            streamInterval = setInterval(sendFrame, FRAME_RATE_MS);
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.error) {
                console.error("WS Error:", data.error);
                return;
            }
            displayResults(data);
            updateFPS();
        };
        
        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            if (streamInterval) clearInterval(streamInterval);
        };
    }

    function sendFrame() {
        if (!ws || ws.readyState !== WebSocket.OPEN || !cameraStream) return;

        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 JPEG
        // We use lower quality (0.6) for faster transmission
        const frameData = canvas.toDataURL('image/jpeg', 0.6);
        
        ws.send(JSON.stringify({ frame: frameData }));
    }

    function updateFPS() {
        frameCount++;
        const now = Date.now();
        if (now - lastFpsTime >= 1000) {
            fpsCounter.textContent = `${frameCount} FPS`;
            frameCount = 0;
            lastFpsTime = now;
        }
    }

    // ==========================================
    // UI Helpers
    // ==========================================
    function showLoading() {
        emptyState.classList.add('hidden');
        resultsContent.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
    }

    function resetResults() {
        emptyState.classList.remove('hidden');
        resultsContent.classList.add('hidden');
        loadingIndicator.classList.add('hidden');
        statusBanner.className = 'status-banner'; // reset classes
    }

    function displayResults(data) {
        loadingIndicator.classList.add('hidden');
        emptyState.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        analyzeBtn.disabled = false;

        // Set Caption
        captionText.textContent = data.caption;

        // Set Classification UI
        const isSafe = data.classification.toUpperCase() === 'SAFE';
        classificationResult.textContent = data.classification.toUpperCase();
        
        if (isSafe) {
            statusBanner.className = 'status-banner safe';
            dangerReason.textContent = "Scene appears clear of hazards.";
        } else {
            statusBanner.className = 'status-banner dangerous';
            dangerReason.textContent = data.danger_reason || "Warning: Potential hazard detected!";
        }

        // Set Metrics
        latencyVal.textContent = `${data.latency_ms.toFixed(0)} ms`;
    }
});
