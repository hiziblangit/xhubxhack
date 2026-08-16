import os
import time
import json
import requests
from collections import defaultdict

class APIKeyRotator:
    def __init__(self):
        self.keys = {
            'deepseek': [os.getenv('DEEPSEEK_KEY_1', ''), os.getenv('DEEPSEEK_KEY_2', '')],
            'gemini': [os.getenv('GEMINI_KEY_1', ''), os.getenv('GEMINI_KEY_2', '')],
        }
        self.key_status = defaultdict(lambda: {
            'usage': 0,
            'limit': 100,
            'last_reset': time.time(),
            'blocked_until': 0
        })
        self.cache = {}

    def call_api_with_rotation(self, provider_type, payload):
        """Panggil API dengan logika rotasi kunci"""
        if provider_type not in self.keys:
            return {"success": False, "error": f"Provider tidak dikenal: {provider_type}"}
        
        keys = self.keys[provider_type]
        if not keys or not keys[0]:
            return {"success": False, "error": f"Tidak ada API key untuk {provider_type}"}
        
        # Coba kunci pertama
        try:
            status = self.key_status[provider_type]
            if status['usage'] >= status['limit']:
                # Rotasi ke kunci berikutnya
                self.keys[provider_type] = [self.keys[provider_type][1], self.keys[provider_type][0]]
                status['usage'] = 0
            
            status['usage'] += 1
            
            # Panggilan API aktual akan ke sini
            return {"success": True, "response": "Panggilan API berhasil", "provider": provider_type}
        except Exception as e:
            return {"success": False, "error": str(e)}

key_rotator = APIKeyRotator()
