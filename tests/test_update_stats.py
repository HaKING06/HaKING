"""Unit tests for Steam library valuation and snapshot persistence in update_stats.py."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import update_stats


class UpdateStatsTests(unittest.TestCase):
    def test_get_library_valuation_batches_and_sums_usd_cents(self):
        batch_one = Mock(
            ok=True,
            json=Mock(
                return_value={
                    "730": {"success": True, "data": []},
                    "2669320": {
                        "success": True,
                        "data": {"price_overview": {"currency": "USD", "final": 6999, "initial": 6999}},
                    },
                }
            ),
        )
        batch_two = Mock(
            ok=True,
            json=Mock(
                return_value={
                    "292030": {
                        "success": True,
                        "data": {"price_overview": {"currency": "USD", "final": 799, "initial": 2999}},
                    },
                    "100": {"success": False},
                }
            ),
        )

        with patch.object(update_stats.requests, "get", side_effect=[batch_one, batch_two]) as get_mock:
            result = update_stats.get_library_valuation([730, 2669320, 730, 292030, 100], chunk_size=2)

        self.assertEqual(get_mock.call_count, 2)
        self.assertEqual(
            result,
            {
                "account_value_usd": 78,
                "account_value_list_usd": 100,
                "account_value_priced_apps": 2,
                "account_value_region": "TR",
            },
        )

    def test_get_library_valuation_returns_none_on_partial_batch_failure(self):
        ok_response = Mock(
            ok=True,
            json=Mock(
                return_value={
                    "2669320": {
                        "success": True,
                        "data": {"price_overview": {"currency": "USD", "final": 6999, "initial": 6999}},
                    }
                }
            ),
        )
        rate_limited = Mock(ok=False)

        with patch.object(update_stats.requests, "get", side_effect=[ok_response, rate_limited]):
            self.assertIsNone(update_stats.get_library_valuation([2669320, 292030], chunk_size=1))

    def test_write_if_changed_preserves_previous_valuation_when_missing(self):
        with tempfile.TemporaryDirectory() as directory:
            output_path = Path(directory) / "steam_stats.json"
            previous = {
                "schema_version": 4,
                "total_games": 2,
                "total_hours": "10h",
                "games": [],
                "top_games": [],
                "system_status": "ONLINE",
                "account_value_usd": 3262,
                "account_value_list_usd": 3532,
                "account_value_priced_apps": 242,
                "account_value_region": "TR",
                "updated_at": "2026-11-15T10:39:35Z",
            }
            output_path.write_text(json.dumps(previous), encoding="utf-8")

            incoming = {
                "schema_version": 4,
                "total_games": 2,
                "total_hours": "10h",
                "games": [],
                "top_games": [],
                "system_status": "OFFLINE",
            }

            with patch.object(update_stats, "OUTPUT_PATH", output_path):
                changed = update_stats.write_if_changed(dict(incoming))

            self.assertTrue(changed)
            saved = json.loads(output_path.read_text(encoding="utf-8"))
            self.assertEqual(saved["account_value_usd"], 3262)
            self.assertEqual(saved["account_value_list_usd"], 3532)
            self.assertEqual(saved["account_value_priced_apps"], 242)
            self.assertEqual(saved["account_value_region"], "TR")


if __name__ == "__main__":
    unittest.main()
