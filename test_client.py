import websocket
import asyncio
import json
import base64

def on_message(ws, message):
    print("Received message from server.")
    data = json.loads(message)
    
    if data.get("imageData"):
        print("Image data received. Decoding and saving...")
        image_data = base64.b64decode(data["imageData"])
        with open("generated_image.png", "wb") as f:
            f.write(image_data)
        print("Image saved as generated_image.png")
    else:
        print("No image data in response.")
        print(message)


def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    prompt = input("Enter a prompt: ")
    ws.send(prompt)

if __name__ == "__main__":
    # You might need to `pip install websocket-client`
    ws = websocket.WebSocketApp("ws://localhost:8000/ws",
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)

    ws.run_forever()
