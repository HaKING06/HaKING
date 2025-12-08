import os
import json
import requests

# GitHub kasasından anahtarı alıyoruz
API_KEY = os.environ["STEAM_API_KEY"]
# Senin Steam ID'n (Sabit)
STEAM_ID = "76561199760755154" 

def get_steam_data():
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={API_KEY}&steamid={STEAM_ID}&format=json"
    response = requests.get(url)
    data = response.json()
    
    if "response" in data and "games" in data["response"]:
        games = data["response"]["games"]
        game_count = data["response"]["game_count"] # Toplam Oyun Sayısı
        
        total_minutes = 0
        specific_games = {}
        
        # Sitede gösterdiğin oyunların ID'leri (Bunları senin için hazırladım)
        target_ids = {
            2669320: "fc25",
            261550: "bannerlord",
            292030: "witcher3",
            2322010: "godofwar",
            379430: "kingdomcome",
            1091500: "cyberpunk"
        }

        for game in games:
            # Toplam süreyi hesapla
            total_minutes += game["playtime_forever"]
            
            # Özel oyunlardan biri mi diye kontrol et
            app_id = game["appid"]
            if app_id in target_ids:
                # Dakikayı saate çevir (virgüllü)
                hours = round(game["playtime_forever"] / 60, 1)
                specific_games[target_ids[app_id]] = f"{hours}h"

        # Toplam saati hesapla (Tam sayı)
        total_hours = int(total_minutes / 60)
        
        return {
            "total_games": game_count,
            "total_hours": f"{total_hours:,}h", 
            "games_playtime": specific_games
        }
    return None

stats = get_steam_data()

if stats:
    # Veriyi steam_data.json dosyasına yaz
    with open("steam_data.json", "w") as f:
        json.dump(stats, f)
    print("Veriler başarıyla güncellendi!")
else:
    print("Veri çekilemedi, hata oluştu.")