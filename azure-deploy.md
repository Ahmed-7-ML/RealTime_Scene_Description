# Azure Student Free Tier Deployment Guide (Portal/Website Version)

This guide walks you through deploying the application **entirely through the Azure Portal Website**, with zero command-line tools required.

## Prerequisites
- An active **Azure for Students** Account ($100 credit)
- A free **GitHub** account

---

## Step 1: Upload Your Code to GitHub
Azure Web Apps can automatically pull, build, and deploy code directly from a private or public GitHub repository.
1. Go to [GitHub](https://github.com/) and create a new repository (e.g., `vision-assist-app`).
2. Upload all the files from this project (including `Dockerfile`, `requirements.txt`, and the `src/` folder) into that repository.

---

## Step 2: Get a Hugging Face API Key
Before deploying, you need a Hugging Face API key to process the images natively in the cloud for free.

1. Go to [Hugging Face](https://huggingface.co/) and create a free account if you don't have one.
2. Log in and go to your **Settings** (click your profile picture in the top right).
3. Click on **Access Tokens** on the left menu.
4. Click **New token**.
   - **Name**: Give it a descriptive name (e.g., `vision-assist-app`).
   - **Role**: `Read` is sufficient for using the Inference API.
5. Click **Generate a token** and copy the generated token. Keep it secret!

---

## Step 3: Create and Deploy the Web App

1. Go back to the [Azure Portal](https://portal.azure.com/) home screen.
2. Search for **App Services** and click it.
3. Click **+ Create** -> **Web App**.
4. Fill in the **Basics** tab:
   - **Subscription**: Azure for Students
   - **Resource Group**: Select the one you made earlier (`visionassist-rg`).
   - **Name**: A unique name (e.g., `visionassist-api-mr`). This will literally be your URL!
   - **Publish**: Choose **Docker Container**.
   - **Operating System**: **Linux**.
   - **Region**: Choose the region closest to you (e.g., East US).
   - **Pricing Plan**: Click "Explore pricing plans", select the **Free (F1)** or **Basic (B1)** tier so it satisfies the student credit limits.
5. Go to the **Docker** tab at the top:
   - **Options**: Single Container
   - **Image Source**: GitHub Action
   - A box will appear asking you to log into GitHub. Authorize it!
   - **Organization**: Your GitHub Username
   - **Repository**: The repository you made in Step 1
   - **Branch**: `main` or `master`
6. Click **Review + Create**, then click **Create**.
   - *Azure will automatically create a GitHub Action in your repo that builds the Dockerfile we provided and deploys it!*

---

## Step 4: Add Environment Variables
Your app needs the AI keys to function.

1. Wait for the Web App deployment to finish, then click **Go to resource**.
2. On the left menu, under the **Settings** section, click **Environment variables**.
3. Under the **App settings** tab, click **+ Add** and add these two exact variables one by one:
   - Name: `HUGGINGFACE_API_KEY` | Value: *(Paste the Token from Step 2)*
   - Name: `HUGGINGFACE_MODEL_URL` | Value: `https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning`
4. Click **Apply** at the bottom, then click **Confirm** in the pop-up to restart the server.

---

## Step 5: Update Frontend URL
Once the App Service is running, it will give you a default URL on its Overview page (e.g., `https://visionassist-api-mr.azurewebsites.net`).

1. Open `src/frontend/app.js` locally (or in GitHub).
2. Update the API URLs at the top of the file to your new Azure URL:
   ```javascript
   const API_BASE_URL = 'https://visionassist-api-mr.azurewebsites.net';
   const WS_URL = 'wss://visionassist-api-mr.azurewebsites.net/ws/livestream';
   ```
3. Since we deployed the frontend inside the same backend container for simplicity, you can just visit your Azure URL in your browser, and the app will load!
