# backend/utils/api_key_rotator.py
import os
import time
import json
import requests
from collections import defaultdict
from datetime import datetime

class APIKeyRotator:
    def __init__(self):
        # 1. Kumpulkan semua API Key dari Environment Variables (file .env di Railway)
        self.keys = {
            'deepseek': [
                os.getenv('DEEPSEEK_KEY_1', ''),
                os.getenv('DEEPSEEK_KEY_2', ''),
                os.getenv('DEEPSEEK_KEY_3', ''),
            ],
            'gemini': [
                os.getenv('GEMINI_KEY_1', ''),
                os.getenv('GEMINI_KEY_2', ''),
            ],
        }
        
        # 2. Catat status pemakaian tiap key (berdasarkan hari)
        self.key_status = defaultdict(lambda: {
            'usage': 0,              # Sudah berapa kali dipakai hari ini
            'limit': 100,            # Batas maksimal per hari (gratis tier)
            'last_reset_day': datetime.now().day, # Hari terakhir reset
            'blocked_until': 0      # Kapan key boleh dipakai lagi (jika kena 429)
        })
        self.cache = {}

    def _check_reset(self, key_id: str):
        """Reset quota jika sudah berganti hari"""
        status = self.key_status[key_id]
        today = datetime.now().day
        if today != status['last_reset_day']:
            status['usage'] = 0
            status['last_reset_day'] = today
            status['blocked_until'] = 0
            print(f"🔄 Quota untuk {key_id} telah di-reset untuk hari baru!")

    def _get_best_key(self):
        """Cari key terbaik yang masih punya quota dan belum diblokir"""
        for provider in self.keys:
            for idx, key in enumerate(self.keys[provider]):
                if not key: continue
                
                key_id = f"{provider}:{idx}"
                status = self.key_status[key_id]
                
                # Cek reset harian
                self._check_reset(key_id)
                
                # Jika blokir waktu masih berlaku atau quota habis, skip
                if time.time() < status['blocked_until']: continue
                if status['usage'] >= status['limit']: continue
                
                return (provider, idx, key) # Kirim key yang available
        return None # Semua key habis

    def call_api_with_rotation(self, provider_type: str, payload: dict):
        # Cek cache dulu (hemat quota)
        cache_key = f"{provider_type}:{json.dumps(payload)}"
        if cache_key in self.cache:
            cached, timestamp = self.cache[cache_key]
            if time.time() - timestamp < 3600: # 1 jam cache
                return cached

        # Ambil key terbaik yang tersedia
        selected = self._get_best_key()
        if not selected:
            return {"error": "All API keys are exhausted (wait until tomorrow)", "status": "exhausted"}

        provider, idx, key = selected
        key_id = f"{provider}:{idx}"
        status = self.key_status[key_id]

        try:
            # Kirim request (sesuaikan endpoint dengan provider)
            if provider == 'deepseek':
                url = "https://api.deepseek.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {key}"}
                response = requests.post(url, json=payload, headers=headers, timeout=10)
            elif provider == 'gemini':
                url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={key}"
                response = requests.post(url, json=payload, timeout=10)
            else:
                return {"error": "Unknown provider"}

            # Jika sukses
            if response.status_code == 200:
                status['usage'] += 1 # Tambah pemakaian
                result = response.json()
                self.cache[cache_key] = (result, time.time()) # Simpan di cache
                return result
            
            # Jika quota habis (429) atau auth error (401)
            elif response.status_code in [429, 401, 403]:
                status['blocked_until'] = time.time() + 3600 # Blokir 1 jam
                print(f"⚠️ Key {key_id} habis/diblokir, mencoba key lain...")
                return self.call_api_with_rotation(provider_type, payload) # Coba pindah key lain
            
            else:
                return {"error": f"API error {response.status_code}"}

        except Exception as e:
            return {"error": str(e)}

# Buat instance global
key_rotator = APIKeyRotator()
