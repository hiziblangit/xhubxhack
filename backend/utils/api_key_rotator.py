import os, time, json, requests
from collections import defaultdict

class APIKeyRotator:
    def __init__(self):
        self.keys = {
            'deepseek': [os.getenv('DEEPSEEK_KEY_1', ''), os.getenv('DEEPSEEK_KEY_2', '')],
            'gemini': [os.getenv('GEMINI_KEY_1', ''), os.getenv('GEMINI_KEY_2', '')],
        }
        self.key_status = defaultdict(lambda: {'usage':0, 'limit':100, 'last_reset':time.time(), 'blocked_until':0})
        self.cache = {}
    def call_api_with_rotation(self, provider_type, payload):
        return {"success": True, "response": "test"}
key_rotator = APIKeyRotator()
