import React, { useState } from 'react';
import './PulseUploader.css';

const PulseUploader: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [humDescription, setHumDescription] = useState('');
    const [vibe, setVibe] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setAudioFile(event.target.files[0]);
        }
    };

    const handleGenerateClick = async () => {
        if (!audioFile) {
            setErrorMessage('Please select an audio file.');
            return;
        }
        if (!vibe.trim()) {
            setErrorMessage('Please describe the vibe.');
            return;
        }

        setStatus('generating');
        setErrorMessage('');
        setGeneratedAudioUrl(null);

        const formData = new FormData();
        formData.append('hum_audio', audioFile);
        formData.append('hum_description', humDescription || 'a hummed melody');
        formData.append('vibe', vibe);

        try {
            const response = await fetch('http://127.0.0.1:5001/generate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            setGeneratedAudioUrl(audioUrl);
            setStatus('success');

        } catch (err) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
        }
    };

    return (
        <div className="pulse-uploader">
            <div className="input-group">
                <label htmlFor="file-upload" className="file-upload-label">
                    1. Upload Your Hum
                </label>
                <input id="file-upload" type="file" accept="audio/*" onChange={handleFileChange} />
                {audioFile && <p className="file-name">Selected: {audioFile.name}</p>}
            </div>

            <div className="input-group">
                <label htmlFor="hum-description">2. Describe Your Melody (Optional)</label>
                <input
                    id="hum-description"
                    type="text"
                    value={humDescription}
                    onChange={(e) => setHumDescription(e.target.value)}
                    placeholder="e.g., a simple, melancholic melody"
                />
            </div>

            <div className="input-group">
                <label htmlFor="vibe">3. Set the Vibe</label>
                <input
                    id="vibe"
                    type="text"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder="e.g., lo-fi hip hop beat"
                />
            </div>

            <button onClick={handleGenerateClick} disabled={status === 'generating'}>
                {status === 'generating' ? 'Generating...' : 'Generate Track'}
            </button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {status === 'generating' && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>AI is conducting... this may take a minute.</p>
                </div>
            )}

            {status === 'success' && generatedAudioUrl && (
                <div className="audio-player-container">
                    <h3>Your track is ready!</h3>
                    <audio controls src={generatedAudioUrl}></audio>
                </div>
            )}
        </div>
    );
};

export default PulseUploader;
