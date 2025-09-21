from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from vibe import get_image_data
import json

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        prompt = await websocket.receive_text()
        image_data = get_image_data(prompt)
        response = { "imageData": image_data }
        await websocket.send_text(json.dumps(response))
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
