"""Metadata-only Steam resolver regression tests; no image downloads."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import resolve_media

class MediaPipelineTests(unittest.TestCase):
    def test_actual_media_not_open_graph_thumbnail_is_selected(self):
        parser = resolve_media.MediaParser()
        parser.feed('<meta property="og:image" content="https://images.steamusercontent.com/ugc/111/THUMB/">'
                    '<img src="https://images.steamusercontent.com/ugc/222/FULL/?imw=1024&amp;imh=576" id="ActualMedia">')
        self.assertEqual(resolve_media.validated_url(parser.original),
            'https://images.steamusercontent.com/ugc/222/FULL/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&letterbox=false')

    def test_rate_limit_and_source_validation(self):
        self.assertEqual(resolve_media.retry_delay(Mock(headers={'Retry-After': '180'}), 0), 180)
        self.assertEqual(resolve_media.retry_delay(Mock(headers={}), 1), 180)
        for url in ['https://example.com/ugc/123/ABC/', 'file:///tmp/a.png', 'https://images.steamusercontent.com.evil.test/ugc/123/ABC/', 'https://user@images.steamusercontent.com/ugc/123/ABC/']:
            with self.assertRaises(ValueError): resolve_media.validated_url(url)

    def test_existing_original_uses_no_network_and_removes_legacy_cache_reference(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'screenshots.json'
            path.write_text(json.dumps({'items':[{'id':'123','original':'https://images.steamusercontent.com/ugc/123/ABC/','media':{'full':'assets/gallery/123-full.webp'}}]}))
            with patch.object(resolve_media,'DATA',path), patch.object(resolve_media.requests,'Session') as session:
                self.assertTrue(resolve_media.run())
                session.return_value.get.assert_not_called()
            self.assertNotIn('media',json.loads(path.read_text())['items'][0])
            self.assertEqual([p.name for p in Path(directory).iterdir()],['screenshots.json'])

if __name__ == '__main__': unittest.main()
