import os
import base64
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_image_data(prompt: str):
    """Generates an image using the Gemini API and returns it as a base64 encoded string."""
    try:
        model = genai.GenerativeModel(model_name="gemini-2.5-flash-image-preview")
        print(f"Sending prompt to Gemini API: '{prompt}'")
        response = model.generate_content(prompt)
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                image_data = part.inline_data.data
                # Encode the image data as a base64 string
                return base64.b64encode(image_data).decode('utf-8')
        print("Error: No image data found in API response.")
        return None
    except Exception as e:
        print(f"An error occurred during image generation: {e}")
        return None