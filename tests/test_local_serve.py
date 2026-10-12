"""HTTP-level checks for current source, conditional requests and untouched assets."""
from functools import partial
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import sys
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from serve import GameRequestHandler


class LocalServeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='ashen-serve-test-')
        self.root = Path(self.temp.name)
        for name in ['web/launcher.html', 'dist/index.html', 'dist/game-v14.js',
                     'dist/visuals-v14.js', 'dist/story-illustrations-v19.js', 'dist/style-v14.css']:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, target)
        (self.root / 'source').mkdir()
        (self.root / 'source/CURRENT_STATE.json').write_text(json.dumps({'product_version':'30'}))
        (self.root / 'dist/sample.js').write_text('export const sample=1;')
        (self.root / 'dist/picture.png').write_bytes(b'original image fixture\0\xff')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(GameRequestHandler, root=self.root))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temp.cleanup()

    def request(self, path, **kwargs):
        return urlopen(Request(self.url + path, **kwargs), timeout=5)

    def test_both_entry_paths_contain_loading_ui_before_any_module_runs(self):
        for path in ['/', '/index.html?story-test=1']:
            with self.request(path) as response:
                body = response.read().decode()
                self.assertIn('id="boot-status"', body)
                self.assertIn('id="boot-retry"', body)
                self.assertIn('启动游戏的终端', body)
                self.assertIn('V30', body)
                self.assertNotIn('<!--GAME_', body)
                self.assertIn('no-store', response.headers['Cache-Control'])

    def test_old_conditionals_receive_current_js_css_and_html(self):
        headers = {'If-Modified-Since':'Wed, 01 Jan 2098 00:00:00 GMT', 'If-None-Match':'"old-build"'}
        for path in ['/', '/index.html', '/sample.js?old=1', '/game-v14.js', '/style-v14.css']:
            with self.request(path, headers=headers) as response:
                self.assertEqual(response.status, 200)
                self.assertIn('no-store', response.headers['Cache-Control'])
                self.assertGreater(len(response.read()), 0)
        (self.root / 'dist/sample.js').write_text('export const sample=2;')
        with self.request('/sample.js', headers=headers) as response:
            self.assertEqual(response.read(), b'export const sample=2;')

    def test_module_mime_head_and_wrapping_preserve_disk(self):
        path = self.root / 'dist/visuals-v14.js'
        original = path.read_bytes()
        with self.request('/visuals-v14.js') as response:
            body = response.read()
            self.assertIn('text/javascript', response.headers['Content-Type'])
            self.assertIn(b'globalThis.__ASHEN_WEB__.run', body)
        with self.request('/visuals-v14.js', method='HEAD') as response:
            self.assertEqual(int(response.headers['Content-Length']), len(body))
            self.assertEqual(response.read(), b'')
        self.assertEqual(path.read_bytes(), original)

    def test_images_keep_bytes_and_cache_and_missing_module_is_404(self):
        with self.request('/picture.png') as response:
            self.assertEqual(response.read(), b'original image fixture\0\xff')
            modified = response.headers['Last-Modified']
            self.assertIsNone(response.headers['Cache-Control'])
        with self.assertRaises(HTTPError) as error:
            self.request('/picture.png', headers={'If-Modified-Since':modified})
        self.assertEqual(error.exception.code, 304)
        error.exception.close()
        with self.assertRaises(HTTPError) as error:
            self.request('/not-a-game-module.js')
        self.assertEqual(error.exception.code, 404)
        error.exception.close()


if __name__ == '__main__':
    unittest.main()
