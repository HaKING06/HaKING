import os
import json
import requests

API_KEY = os.environ["STEAM_API_KEY"]
STEAM_ID = "76561199760755154" 

def get_steam_data():
    # 1. OYUNLARI ÇEK
    games_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={API_KEY}&steamid={STEAM_ID}&format=json"
    games_response = requests.get(games_url)
    games_data = games_response.json()
    
    # 2. PROFİL DURUMUNU ÇEK
    user_url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={API_KEY}&steamids={STEAM_ID}"
    user_response = requests.get(user_url)
    user_data = user_response.json()

    # Varsayılanlar
    game_count = 0
    total_hours = "0h"
    specific_games = {}
    system_status = "OFFLINE" # Sadece KOD gönderiyoruz

    # --- OYUN VERİLERİ ---
    if "response" in games_data and "games" in games_data["response"]:
        games = games_data["response"]["games"]
        game_count = games_data["response"]["game_count"]
        
        total_minutes = 0
        target_ids = {
            2669320: "fc25",
            261550: "bannerlord",
            292030: "witcher3",
            2322010: "godofwar",
            379430: "kingdomcome",
            1091500: "cyberpunk"
        }

        for game in games:
            total_minutes += game["playtime_forever"]
            app_id = game["appid"]
            if app_id in target_ids:
                hours = round(game["playtime_forever"] / 60, 1)
                specific_games[target_ids[app_id]] = f"{hours}h"

        total_h_val = int(total_minutes / 60)
        total_hours = f"{total_h_val:,}h"

    # --- ONLINE DURUMU ---
    if "response" in user_data and "players" in user_data["response"]:
        players = user_data["response"]["players"]
        if len(players) > 0:
            state = players[0].get("personastate", 0)
            if state > 0: 
                system_status = "ONLINE" # Sadece KOD
            else:
                system_status = "OFFLINE" # Sadece KOD

    return {
        "total_games": game_count,
        "total_hours": total_hours,
        "games_playtime": specific_games,
        "system_status": system_status
    }

stats = get_steam_data()

if stats:
    with open("steam_data.json", "w") as f:
        json.dump(stats, f)
    print("Veriler güncellendi!")