"""Fetch public Steam profile and playtime data for the static site.

The API key is read only from STEAM_API_KEY. It is never written to the
generated JSON file or printed in errors/logs.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests


STEAM_ID = "76561199760755154"
API_BASE_URL = "https://api.steampowered.com"
STORE_APPDETAILS_URL = "https://store.steampowered.com/api/appdetails"
STORE_COUNTRY_CODE = "tr"
PRICE_BATCH_SIZE = 60
OUTPUT_PATH = Path(__file__).resolve().parent / "data" / "steam_stats.json"
TOP_GAME_LIMIT = 6
VALUATION_KEYS = (
    "account_value_usd",
    "account_value_list_usd",
    "account_value_priced_apps",
    "account_value_region",
)


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


def get_store_cover_url(appid):
    """Resolve Steam's current, versioned store artwork URL for a game."""
    try:
        response = requests.get(
            "https://store.steampowered.com/api/appdetails",
            params={"appids": appid, "l": "english"},
            timeout=8,
        )
        if not response.ok:
            return ""
        payload = response.json()
    except (requests.RequestException, ValueError):
        return ""

    details = payload.get(str(appid), {}) if isinstance(payload, dict) else {}
    game_data = details.get("data", {}) if isinstance(details, dict) else {}
    cover_url = game_data.get("header_image", "") if isinstance(game_data, dict) else ""
    if not isinstance(cover_url, str):
        return ""

    parsed = urlparse(cover_url)
    allowed_hosts = {"shared.akamai.steamstatic.com", "shared.cloudflare.steamstatic.com"}
    if parsed.scheme != "https" or parsed.hostname not in allowed_hosts:
        return ""
    return cover_url


def get_library_valuation(appids, country_code=STORE_COUNTRY_CODE, chunk_size=PRICE_BATCH_SIZE):
    """Estimate current and base USD Steam Store values across all owned appids."""
    unique_ids = []
    seen = set()
    for raw_id in appids:
        try:
            appid = int(raw_id)
        except (TypeError, ValueError):
            continue
        if appid > 0 and appid not in seen:
            seen.add(appid)
            unique_ids.append(appid)

    if not unique_ids:
        return None

    final_cents = 0
    initial_cents = 0
    priced_count = 0

    for start in range(0, len(unique_ids), max(1, int(chunk_size))):
        batch = unique_ids[start : start + max(1, int(chunk_size))]
        try:
            response = requests.get(
                STORE_APPDETAILS_URL,
                params={
                    "appids": ",".join(str(appid) for appid in batch),
                    "cc": country_code,
                    "filters": "price_overview",
                },
                timeout=12,
            )
            if not response.ok:
                return None
            payload = response.json()
        except (requests.RequestException, ValueError):
            return None

        if not isinstance(payload, dict):
            return None

        for appid in batch:
            details = payload.get(str(appid))
            data = details.get("data") if isinstance(details, dict) and details.get("success") else None
            price_info = data.get("price_overview") if isinstance(data, dict) else None
            if not isinstance(price_info, dict) or price_info.get("currency") != "USD":
                continue

            try:
                final_val = max(0, int(price_info.get("final", 0) or 0))
                initial_val = max(0, int(price_info.get("initial", final_val) or 0))
            except (TypeError, ValueError):
                continue

            final_cents += final_val
            initial_cents += max(initial_val, final_val)
            priced_count += 1

    if priced_count == 0:
        return None

    return {
        "account_value_usd": round(final_cents / 100),
        "account_value_list_usd": round(initial_cents / 100),
        "account_value_priced_apps": priced_count,
        "account_value_region": country_code.upper(),
    }


def get_steam_data(api_key):
    """Return account totals, the full Steam library, and its six top games."""
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

    library_games = []
    total_minutes = 0
    for game in games:
        if not isinstance(game, dict):
            continue

        try:
            appid = int(game.get("appid"))
            minutes = max(0, int(game.get("playtime_forever", 0)))
        except (TypeError, ValueError):
            continue

        name = game.get("name")
        if not isinstance(name, str) or not name.strip():
            name = f"Steam oyunu {appid}"
        icon_hash = game.get("img_icon_url", "")
        if not isinstance(icon_hash, str):
            icon_hash = ""

        total_minutes += minutes
        library_games.append(
            {
                "appid": appid,
                "name": name.strip(),
                "playtime_minutes": minutes,
                "icon_hash": icon_hash,
            }
        )

    library_games.sort(
        key=lambda game: (-game["playtime_minutes"], game["name"].casefold(), game["appid"])
    )
    top_games = [game for game in library_games if game["playtime_minutes"] > 0][:TOP_GAME_LIMIT]
    for game in top_games:
        cover_url = get_store_cover_url(game["appid"])
        if cover_url:
            game["cover_url"] = cover_url
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

    stats = {
        "schema_version": 4,
        "total_games": int(games_response.get("game_count") or len(library_games)),
        "total_hours": f"{total_minutes // 60:,}h",
        "games": library_games,
        "top_games": top_games,
        "system_status": system_status,
    }
    valuation = get_library_valuation([game["appid"] for game in library_games])
    if valuation:
        stats.update(valuation)
    return stats


def write_if_changed(stats):
    """Persist a new snapshot only when its public data actually changed."""
    previous = None
    if OUTPUT_PATH.exists():
        try:
            previous = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = None

    if "account_value_usd" not in stats and isinstance(previous, dict):
        for key in VALUATION_KEYS:
            if key in previous:
                stats[key] = previous[key]

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
        print("Steam profili, tam oyun kütüphanesi ve ilk altı oyun güncellendi.")
    else:
        print("Steam verilerinde değişiklik yok; yeni dağıtım tetiklenmedi.")


if __name__ == "__main__":
    main()
