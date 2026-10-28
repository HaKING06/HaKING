"""Fetch public Steam profile and playtime data for the static site.

The API key is read only from STEAM_API_KEY. It is never written to the
generated JSON file or printed in errors/logs.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests


STEAM_ID = "76561199760755154"
API_BASE_URL = "https://api.steampowered.com"
OUTPUT_PATH = Path(__file__).resolve().parent / "data" / "steam_stats.json"
TOP_GAME_LIMIT = 6


def steam_get(endpoint, api_key, **extra_params):
    """Request a Steam endpoint without exposing credentials in error output."""
    try:
        response = requests.get(
            f"{API_BASE_URL}/{endpoint}",
            params={"key": api_key, **extra_params},
            timeout=20,
        )
    except requests.RequestException:
        raise RuntimeError("Steam API bağlantısı başarısız oldu.") from None

    if not response.ok:
        raise RuntimeError(f"Steam API HTTP hatası: {response.status_code}.")

    try:
        payload = response.json()
    except ValueError:
        raise RuntimeError("Steam API geçerli JSON verisi döndürmedi.") from None
    if not isinstance(payload, dict):
        raise RuntimeError("Steam API beklenmeyen bir veri biçimi döndürdü.")
    return payload


def get_steam_data(api_key):
    """Return current account totals and the six most-played owned games."""
    games_data = steam_get(
        "IPlayerService/GetOwnedGames/v1/",
        api_key,
        steamid=STEAM_ID,
        include_appinfo=1,
        include_played_free_games=1,
    )
    games_response = games_data.get("response", {})
    games = games_response.get("games")

    # Do not publish empty totals if Steam hides the game details or the API
    # returns an incomplete response. Keeping the last good snapshot is safer.
    if not isinstance(games, list) or not games:
        raise RuntimeError(
            "Steam oyun listesi alınamadı. Profilde oyun ayrıntılarının herkese açık olduğunu kontrol edin."
        )

    games_with_playtime = []
    total_minutes = 0
    for game in games:
        appid = game.get("appid")
        minutes = game.get("playtime_forever", 0)
        try:
            appid = int(appid)
            minutes = max(0, int(minutes))
        except (TypeError, ValueError):
            continue

        total_minutes += minutes
        if minutes <= 0:
            continue

        name = game.get("name")
        if not isinstance(name, str) or not name.strip():
            name = f"Steam oyunu {appid}"

        games_with_playtime.append(
            {
                "appid": appid,
                "name": name.strip(),
                "playtime_minutes": minutes,
            }
        )

    games_with_playtime.sort(
        key=lambda game: (-game["playtime_minutes"], game["name"].casefold(), game["appid"])
    )
    top_games = games_with_playtime[:TOP_GAME_LIMIT]
    if not top_games:
        raise RuntimeError("Steam hesabında oynama süresi bulunan oyun yok.")

    system_status = "UNKNOWN"
    try:
        user_data = steam_get("ISteamUser/GetPlayerSummaries/v2/", api_key, steamids=STEAM_ID)
        players = user_data.get("response", {}).get("players", [])
        if players:
            system_status = "ONLINE" if int(players[0].get("personastate", 0) or 0) > 0 else "OFFLINE"
    except RuntimeError:
        # Playtime is the core data; a temporary presence API failure should
        # not prevent the game collection from being refreshed.
        pass

    return {
        "schema_version": 2,
        "total_games": int(games_response.get("game_count") or len(games)),
        "total_hours": f"{total_minutes // 60:,}h",
        "top_games": top_games,
        "system_status": system_status,
    }


def write_if_changed(stats):
    """Persist a new snapshot only when its public data actually changed."""
    previous = None
    if OUTPUT_PATH.exists():
        try:
            previous = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = None

    if previous and previous.get("updated_at"):
        old_data = {key: value for key, value in previous.items() if key != "updated_at"}
        if old_data == stats:
            return False

    stats["updated_at"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = OUTPUT_PATH.with_suffix(".json.tmp")
    temporary_path.write_text(
        json.dumps(stats, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(OUTPUT_PATH)
    return True


def main():
    api_key = os.environ.get("STEAM_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("STEAM_API_KEY ortam değişkeni tanımlı değil.")

    stats = get_steam_data(api_key)
    if write_if_changed(stats):
        print("Steam profili ve en çok oynanan altı oyun güncellendi.")
    else:
        print("Steam verilerinde değişiklik yok; yeni dağıtım tetiklenmedi.")


if __name__ == "__main__":
    main()
