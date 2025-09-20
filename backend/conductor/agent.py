import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

load_dotenv()

class SongStructureAgent:
    """
    An agent that uses an LLM to generate a song structure based on a user's prompt.
    """

    def __init__(self):
        """
        Initializes the SongStructureAgent.
        """
        if not os.environ.get("GOOGLE_API_KEY"):
            raise ValueError("GOOGLE_API_KEY environment variable not set. Please add it to your .env file.")
        
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7, convert_system_message_to_human=True)
        self.prompt_template = self._create_prompt_template()
        self.chain = self.prompt_template | self.llm | StrOutputParser()

    def _create_prompt_template(self):
        """
        Creates the prompt template for the agent.
        """
        template = """
You are an expert music producer AI. Your task is to create a compelling song structure based on a user's description of a melody and a desired vibe.

The user will provide:
1. A description of a hummed melody (e.g., "a simple, melancholic melody").
2. A desired style or vibe (e.g., "lo-fi hip hop beat").

You must generate a JSON object that outlines the song structure. The structure should consist of 4 segments.
Each segment must have a "segment_type" (e.g., "intro", "verse", "chorus", "outro") and a "prompt" that will be fed into a music generation model (like MusicGen).

The prompts for each segment should be descriptive and build upon each other to create a cohesive song.
For the first segment (intro), the prompt should incorporate the user's hum description and style.
For subsequent segments, the prompts should describe how the song should evolve (e.g., "add a simple bassline", "introduce a lead synth melody", "fade out with the main melody").

**User's Hum Description:** "{hum_description}"
**Desired Vibe:** "{vibe}"

**Output JSON:**
"""
        return ChatPromptTemplate.from_template(template)

    def generate_structure(self, hum_description: str, vibe: str) -> dict:
        """
        Generates a song structure.

        Args:
            hum_description (str): A description of the user's hummed melody.
            vibe (str): The desired style or vibe of the song.

        Returns:
            dict: A dictionary representing the song structure.
        """
        try:
            response = self.chain.invoke({"hum_description": hum_description, "vibe": vibe})
            # The response is a JSON string, so we parse it into a Python dict.
            return json.loads(response)
        except json.JSONDecodeError:
            print("Error: The LLM did not return a valid JSON. Returning a default structure.")
            # Fallback to a default structure if JSON parsing fails
            return {
                "song_structure": [
                    {"segment_type": "intro", "prompt": f"A simple intro based on {hum_description} in a {vibe} style."},
                    {"segment_type": "verse", "prompt": "Introduce a basic drum beat and bassline."},
                    {"segment_type": "chorus", "prompt": "The main melody comes in with more energy."},
                    {"segment_type": "outro", "prompt": "Fade out with the main melody and a simple beat."}
                ]
            }
        except Exception as e:
            print(f"An error occurred during structure generation: {e}")
            return {}


if __name__ == '__main__':
    # This is an example of how to use the SongStructureAgent.
    # To run this, you need to:
    # 1. Set your GOOGLE_API_KEY in a .env file in the backend directory.
    #    (e.g., create a .env file with: GOOGLE_API_KEY="your_api_key_here")
    # 2. Run this script from the 'backend' directory: python -m conductor.agent

    load_dotenv()

    # Check for API key before proceeding
    if not os.environ.get("GOOGLE_API_KEY") or os.environ.get("GOOGLE_API_KEY") == "your_api_key_here":
        print("\nERROR: GOOGLE_API_KEY is not set or is a placeholder.")
        print("Please create a .env file in the 'backend' directory and add your key:")
        print('GOOGLE_API_KEY="your_real_api_key"')
    else:
        agent = SongStructureAgent()
        hum_desc = "a catchy, upbeat melody"
        song_vibe = "80s synth-pop with a modern twist" 
        
        print(f"Generating song structure for:\n  Hum: '{hum_desc}'\n  Vibe: '{song_vibe}'\n")
        
        structure = agent.generate_structure(hum_desc, song_vibe)
        
        if structure:
            print("--- Generated Song Structure ---")
            print(json.dumps(structure, indent=2))
            print("--------------------------------")
