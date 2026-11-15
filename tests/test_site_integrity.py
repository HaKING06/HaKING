"""Static site integrity and security regression tests for HaKING."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SiteIntegrityTests(unittest.TestCase):
    def test_version_metadata_matches(self):
        version = (ROOT / 'VERSION').read_text(encoding='utf-8').strip()
        self.assertRegex(version, r'^\d+\.\d+\.\d+$')
        index_html = (ROOT / 'index.html').read_text(encoding='utf-8')
        changelog = (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8')
        self.assertIn(f'<meta name="application-version" content="{version}">', index_html)
        self.assertIn(f'# HaKING {version}', changelog)

    def test_security_hardening_and_external_links(self):
        index_html = (ROOT / 'index.html').read_text(encoding='utf-8')
        main_css = (ROOT / 'assets/css/main.css').read_text(encoding='utf-8')

        self.assertIn('http-equiv="Content-Security-Policy"', index_html)
        self.assertIn('name="referrer" content="strict-origin-when-cross-origin"', index_html)
        self.assertNotIn('onerror=', index_html)
        self.assertNotIn('instagram.com/user/', index_html)
        self.assertIn('github.com/HaKING06', index_html)
        self.assertNotIn('cdn.steamstatic.com/', main_css)
        self.assertTrue((ROOT / 'assets/vendor/lucide.min.js').is_file())
        self.assertTrue((ROOT / 'assets/vendor/GLTFLoader.js').is_file())
        self.assertTrue((ROOT / 'assets/vendor/Reflector.js').is_file())
        self.assertTrue((ROOT / 'assets/vendor/RoomEnvironment.js').is_file())
        self.assertTrue((ROOT / 'assets/images/walpaper.png').is_file())
        self.assertTrue((ROOT / 'assets/images/HICON.png').is_file())
        self.assertIn('assets/images/HICON.png" alt="" class="logo-emblem"', index_html)
        self.assertTrue((ROOT / 'assets/js/museum3d.js').is_file())
        self.assertTrue((ROOT / 'assets/museum/models/marble_bust_01/marble_bust_01_1k.gltf').is_file())
        self.assertTrue((ROOT / 'assets/museum/models/chandelier_02/Chandelier_02_1k.gltf').is_file())

        for tag in re.findall(r'<a\b[^>]*target="_blank"[^>]*>', index_html):
            self.assertIn('noopener', tag)
            self.assertIn('noreferrer', tag)

    def test_locales_and_steam_data_valid(self):
        locales = json.loads((ROOT / 'data/locales.json').read_text(encoding='utf-8'))
        self.assertEqual(len(locales), 20)
        self.assertIn('ar', locales)
        stats = json.loads((ROOT / 'data/steam_stats.json').read_text(encoding='utf-8'))
        self.assertGreater(int(stats['total_games']), 0)
        self.assertTrue(len(stats.get('games', [])) >= int(stats['total_games']))

    def test_css_braces_balanced(self):
        tokens = re.compile(r'/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|[{}]')
        for rel in ('assets/css/main.css', 'assets/css/upgrade.css'):
            raw = (ROOT / rel).read_text(encoding='utf-8')
            depth = 0
            stack = []
            last = 0
            for m in tokens.finditer(raw):
                tok = m.group(0)
                if tok == '{':
                    hdr = ' '.join(re.sub(r'/\*[\s\S]*?\*/', '', raw[last:m.start()]).split())
                    if depth > 0:
                        self.assertTrue(
                            stack[-1],
                            f'Unexpected nested CSS block in {rel} around: {hdr[-80:]!r}',
                        )
                    stack.append('@' in hdr)
                    depth += 1
                    last = m.end()
                elif tok == '}':
                    depth -= 1
                    self.assertGreaterEqual(depth, 0, f'Unexpected closing brace in {rel}')
                    stack.pop()
                    last = m.end()
            self.assertEqual(depth, 0, f'Unbalanced CSS braces in {rel}: depth={depth}')


if __name__ == '__main__':
    unittest.main()
