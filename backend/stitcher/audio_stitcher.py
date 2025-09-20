import requests
import os
from pydub import AudioSegment

class AudioStitcher:
    """
    A class to download and stitch audio files.
    """

    def download_audio(self, url: str, save_path: str) -> bool:
        """
        Downloads an audio file from a URL.

        Args:
            url (str): The URL of the audio file.
            save_path (str): The path to save the downloaded file.

        Returns:
            bool: True if download was successful, False otherwise.
        """
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            with open(save_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error downloading audio from {url}: {e}")
            return False

    def stitch_audio(self, audio_file_paths: list[str], output_path: str, crossfade_duration_ms: int = 150):
        """
        Stitches multiple audio files together with a crossfade.

        Args:
            audio_file_paths (list[str]): A list of paths to the audio files to stitch.
            output_path (str): The path to save the final stitched audio file.
            crossfade_duration_ms (int): The duration of the crossfade in milliseconds.
        """
        if not audio_file_paths:
            print("Error: No audio files provided to stitch.")
            return

        try:
            # Determine file format from the first file's extension
            first_file_ext = os.path.splitext(audio_file_paths[0])[1].replace('.', '')
            if not first_file_ext:
                raise ValueError("First audio file is missing a file extension.")

            full_song = AudioSegment.from_file(audio_file_paths[0], format=first_file_ext)

            for segment_file in audio_file_paths[1:]:
                file_ext = os.path.splitext(segment_file)[1].replace('.', '')
                if not file_ext:
                    raise ValueError(f"Audio file is missing a file extension: {segment_file}")
                next_segment = AudioSegment.from_file(segment_file, format=file_ext)
                full_song = full_song.append(next_segment, crossfade=crossfade_duration_ms)

            # Export in the format specified by the output path extension
            output_format = os.path.splitext(output_path)[1].replace('.', '')
            if not output_format:
                output_format = "wav" # default to wav if no extension
                output_path += ".wav"

            print(f"Exporting stitched audio to {output_path} in {output_format} format...")
            full_song.export(output_path, format=output_format)
            print(f"Successfully stitched audio to {output_path}")

        except FileNotFoundError as e:
            print(f"Error: Audio file not found - {e}")
        except ValueError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"An error occurred during audio stitching: {e}")


if __name__ == '__main__':
    # This is an example of how to use the AudioStitcher class.
    # To run this, you may need ffmpeg installed for pydub to handle various audio formats.
    # Execute this script from the 'backend' directory using the command:
    # python -m stitcher.audio_stitcher

    stitcher = AudioStitcher()
    
    # --- 1. Download Example ---
    # A URL to a short, public domain WAV file for demonstration.
    sample_url = "https://www.soundjay.com/buttons/button-1.wav"
    download_path1 = "segment1.wav"
    download_path2 = "segment2.wav"
    
    print(f"Downloading sample audio from {sample_url}...")
    success1 = stitcher.download_audio(sample_url, download_path1)
    success2 = stitcher.download_audio(sample_url, download_path2)

    if success1 and success2:
        print("Downloads successful.")
        
        # --- 2. Stitching Example ---
        output_path = "stitched_song.mp3" # Example of exporting to a different format
        audio_files = [download_path1, download_path2]
        
        print(f"\nStitching {len(audio_files)} audio files...")
        stitcher.stitch_audio(audio_files, output_path)

        # --- 3. Clean up ---
        print("\nCleaning up temporary files...")
        os.remove(download_path1)
        os.remove(download_path2)
        if os.path.exists(output_path):
            os.remove(output_path)
        print("Done.")
    else:
        print("Could not run stitching example because downloads failed.")
