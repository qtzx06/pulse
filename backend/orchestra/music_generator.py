import replicate
import os
from dotenv import load_dotenv

load_dotenv()

class MusicGenerator:
    """
    A class to interact with the Replicate MusicGen model.
    """

    def __init__(self):
        """
        Initializes the MusicGenerator.
        Checks for the REPLICATE_API_TOKEN environment variable.
        """
        if not os.environ.get("REPLICATE_API_TOKEN"):
            raise ValueError("REPLICATE_API_TOKEN environment variable not set. Please add it to your .env file.")
        # The replicate library automatically uses the token from the environment variable.

    def generate_music_segment(
        self,
        prompt: str,
        input_audio_path: str,
        duration: int,
        continuation: bool = False,
        continuation_start: int = 0,
        continuation_end: int = -1,
        temperature: float = 1.0,
        classifier_free_guidance: int = 3
    ):
        """
        Generates a music segment using the MusicGen model on Replicate.

        Args:
            prompt (str): The text prompt to guide the music generation.
            input_audio_path (str): The path to the input audio file (e.g., a hum).
            duration (int): The duration of the generated audio in seconds (max 30).
            continuation (bool): If True, generates a continuation of the input_audio.
            continuation_start (int): Start time of the segment to continue from.
            continuation_end (int): End time of the segment to continue to.
            temperature (float): Controls the randomness of the output.
            classifier_free_guidance (int): How much to adhere to the prompt.

        Returns:
            str: The URL of the generated audio file, or None if an error occurs.
        """
        # The specific version for the 'stereo-melody-large' model
        model_version = "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906"

        try:
            with open(input_audio_path, "rb") as audio_file:
                params = {
                    "prompt": prompt,
                    "input_audio": audio_file,
                    "duration": duration,
                    "continuation": continuation,
                    "temperature": temperature,
                    "classifier_free_guidance": classifier_free_guidance
                }

                if continuation:
                    params["continuation_start"] = continuation_start
                    params["continuation_end"] = continuation_end

                output = replicate.run(model_version, input=params)
                return output

        except FileNotFoundError:
            print(f"Error: Input audio file not found at {input_audio_path}")
            return None
        except Exception as e:
            print(f"An error occurred during music generation: {e}")
            return None

if __name__ == '__main__':
    # This is an example of how to use the MusicGenerator class.
    # To run this, you need to:
    # 1. Set your REPLICATE_API_TOKEN in a .env file in the backend directory.
    #    Create a file named '.env' and add the line:
    #    REPLICATE_API_TOKEN="your_api_token_here"
    # 2. Have a sample audio file. You can find sample hums in the 'examples/sample-hums' directory
    #    (once they are added). For now, you can use any short .wav or .mp3 file.
    # 3. Run this script from the 'backend' directory: python -m orchestra.music_generator

    # This script should be run from the 'backend' directory.
    # So, the .env file should be at 'backend/.env'
    
    # Create a dummy .env file for demonstration if it doesn't exist
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write("REPLICATE_API_TOKEN=your_api_token_here\n")

    # Create a dummy audio file for testing
    # In a real scenario, you would use a user-provided hum.
    sample_audio_path = "temp_sample.wav"
    with open(sample_audio_path, "wb") as f:
        # A minimal valid WAV file header for a silent mono 44.1kHz file
        f.write(b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00')

    print("--- Example: Generating a new music segment ---")
    
    # The load_dotenv() at the top of the file will load from .env in the current dir (backend)
    generator = MusicGenerator()

    # Check if the API token is the placeholder
    if os.environ.get("REPLICATE_API_TOKEN") == "your_api_token_here":
        print("\nPlease set your actual REPLICATE_API_TOKEN in the .env file to run the example.")
    else:
        initial_output = generator.generate_music_segment(
            prompt="A cheerful, upbeat pop song with a catchy synth melody.",
            input_audio_path=sample_audio_path,
            duration=5  # Keep it short for a quick test
        )
        if initial_output:
            print(f"Successfully generated initial segment: {initial_output}")

            # Example of continuation would go here, using the output of the first call.
            # For simplicity, we are not showing it here as it requires downloading the generated file first.

    # Clean up the dummy files
    os.remove(sample_audio_path)
    if os.path.exists(".env") and open(".env").read().strip() == "REPLICATE_API_TOKEN=your_api_token_here":
        os.remove(".env")
