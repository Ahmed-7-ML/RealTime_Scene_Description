# VisionAssist: AI-Powered Scene Description & Danger Detection

VisionAssist is a real-time web application designed to help visually impaired individuals by analyzing scenes (static images or live camera feeds) and providing descriptive captions along with potential hazard classifications.

## 🌟 Features

*   **Real-Time Processing:** Supports uploading static images or utilizing a live camera feed via WebSockets for instantaneous analysis.
*   **AI Scene Description:** Uses advanced Vision-Language Models (like the Hugging Face `Salesforce/blip-image-captioning-base` or equivalent APIs) to generate accurate natural language descriptions of the scene.
*   **Danger Detection:** Classifies generated captions to determine if a scene is `SAFE` or `DANGEROUS` (e.g., detecting obstacles, holes, or oncoming traffic).
*   **Premium Web Interface:** A beautifully designed, responsive, and accessible dark-themed UI built with modern CSS (glassmorphism, micro-animations) and vanilla JavaScript.
*   **Cloud Ready:** Fully containerized with Docker and includes comprehensive guides for deploying to Microsoft Azure or Render.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (Custom Variables, Flexbox/Grid, Animations), Vanilla JavaScript (WebSockets, Fetch API).
*   **Backend:** Python 3.10+, FastAPI, Uvicorn, WebSockets.
*   **Machine Learning:** PyTorch, Transformers (Hugging Face).
*   **Deployment:** Docker, Azure App Services / Azure Container Apps / Render.

## 📁 Project Structure

```text
📦 Microsoft-Azure-Demo
 ┣ 📂 notebooks/               # Jupyter Notebooks for testing and evaluation
 ┣ 📂 src/
 ┃ ┣ 📂 backend/               # FastAPI Server, Model Loading, Classification Logic
 ┃ ┃ ┣ 📜 main.py              # Main API and WebSocket routes
 ┃ ┃ ┣ 📜 captioner.py         # Image captioning model interface
 ┃ ┃ ┣ 📜 classifier.py        # Danger classification logic
 ┃ ┃ ┗ ...
 ┃ ┗ 📂 frontend/              # User Interface
 ┃   ┣ 📜 index.html           # Main UI layout
 ┃   ┣ 📜 style.css            # Styling and animations
 ┃   ┗ 📜 app.js               # Frontend logic and API/WebSocket connectivity
 ┣ 📜 azure-deploy.md          # Comprehensive cloud deployment guide
 ┣ 📜 Dockerfile               # Container configuration for backend and frontend
 ┗ 📜 requirements.txt         # Python dependencies
```

## 🚀 Getting Started Locally

### Prerequisites

*   Python 3.10 or higher
*   (Optional but recommended) A virtual environment tool like `venv` or `conda`

### Installation

1.  **Clone the repository (or navigate to the folder):**
    ```bash
    git clone https://github.com/Ahmed-7-ML/RealTime_Scene_Description.git
    cd RealTime_Scene_Description
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Start the Backend Server:**
    Navigate to the `src/backend` directory and start Uvicorn:
    ```bash
    cd src/backend
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The API will now be accessible at `http://localhost:8000`.

2.  **Start the Frontend:**
    You can open `src/frontend/index.html` directly in your browser, or for a better experience (especially with camera permissions), serve it via a simple Python HTTP server:
    ```bash
    # Open a new terminal window
    cd src/frontend
    python -m http.server 8080
    ```
    Then, navigate to `http://localhost:8080` in your web browser.

    > **Note:** Update the `API_BASE_URL` and `WS_URL` in `src/frontend/app.js` to point to `localhost:8000` if you are running it locally, or your cloud URL if deployed.

## ☁️ Deployment

This project is configured for easy deployment using Docker. Please refer to the detailed **[Azure Deployment Guide](./azure-deploy.md)** included in this repository for step-by-step instructions on hosting the application for free using:
*   Azure App Services
*   Azure Container Apps
*   Render.com (Recommended Alternative)

You will need a free Hugging Face API key to enable the cloud AI inference without requiring an expensive GPU server.

## 📝 License

This project is created for educational and demonstration purposes.
