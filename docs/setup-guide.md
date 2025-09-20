# Pulse Setup Guide

This guide provides instructions on how to set up the Pulse development environment.

## Prerequisites

-   Python 3.8+
-   Node.js and npm

## Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

## Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install the required npm packages:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

## Running the Backend Server

1.  Make sure you have installed the dependencies as described in the "Backend Setup" section.

2.  Create a `.env` file in the `backend` directory. This file will store your API keys. Add the following lines to it, replacing the placeholder text with your actual keys:
    ```
    REPLICATE_API_TOKEN="your_replicate_api_token"
    GOOGLE_API_KEY="your_google_api_key"
    ```

3.  Navigate to the `backend` directory and run the Flask application:
    ```bash
    cd backend
    python -m api.app
    ```

4.  The backend server will start on `http://127.0.0.1:5001`. You can now send requests to the `/generate` endpoint.
