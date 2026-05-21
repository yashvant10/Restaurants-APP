from fastapi import WebSocket
from typing import List, Dict
import logging

logger = logging.getLogger("websocket")

class ConnectionManager:
    def __init__(self):
        # Maps a channel ID (e.g. 'order_1', 'restaurant_2') to a list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel_id: str):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)
        logger.info(f"Client connected to channel: {channel_id}. Total connections in channel: {len(self.active_connections[channel_id])}")

    def disconnect(self, websocket: WebSocket, channel_id: str):
        if channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)
            if not self.active_connections[channel_id]:
                del self.active_connections[channel_id]
        logger.info(f"Client disconnected from channel: {channel_id}")

    async def broadcast_to_channel(self, channel_id: str, message: dict):
        if channel_id in self.active_connections:
            logger.info(f"Broadcasting to channel '{channel_id}': {message}")
            for connection in self.active_connections[channel_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message on websocket: {e}")

manager = ConnectionManager()
