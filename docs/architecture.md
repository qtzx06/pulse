# Pulse Architecture

## The "LangChain Conductor" System

-   **Conductor (LangChain Agent):** Intelligently breaks down song creation into structured sections.
-   **Orchestra (MusicGen on Replicate):** Generates high-quality audio for each section.
-   **Seamless Stitching:** Uses MusicGen's continuation feature for smooth transitions.

## High-Level Workflow

1.  **Input:** Hummed Melody + Style Prompt (in JSON format).
2.  **LangChain Agent:** Plans the song structure (e.g., Intro, Verse, Chorus, Outro).
3.  **MusicGen API Calls:** Sequentially generates audio for each section using Replicate.com.
4.  **Audio Stitching:** Intelligently stitches the audio segments together, potentially using crossfades.
5.  **Output:** Exports the final, complete track to the frontend.

## Tech Stack

### Core Technologies

-   **AI Models:** Meta's MusicGen (stereo-melody-large) via Replicate API.
-   **Agent Framework:** LangChain for intelligent orchestration.
-   **Audio Processing:** pydub (or a better alternative for seamless stitching).
-   **Backend:** Python.
-   **Frontend:** TBD.

### Key APIs & Services

-   **Replicate API:** `meta/musicgen` model endpoint.
-   **Model Version:** `stereo-melody-large` (supports input audio conditioning).
-   **AI Agent:** Gemini API with LangChain for the conductor.
