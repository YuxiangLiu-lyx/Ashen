#!/usr/bin/env python3
"""Restore original assets and serve current game code with a visible loading UI."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import io
import json
import re
from urllib.parse import unquote, urlsplit

from restore_archives import ROOT, restore
from web_runtime import prepare_module


def launcher(root=ROOT):
    version = str(json.loads((root / 'source/CURRENT_STATE.json').read_text(encoding='utf-8'))['product_version'])
    template = (root / 'web/launcher.html').read_text(encoding='utf-8')
    template = template.replace('V28.1', 'V' + version).replace("version:'28.1'", 'version:' + json.dumps(version))
    template = template.replace('离线版请先完整下载文件，再用 Chrome 或 Edge 打开。',
                                '请确认启动游戏的终端仍在运行，再点击“重新加载”。存档会保留。')
    template = template.replace('“剧情测试 · 免伤”', '“章节测试 · 免伤秒杀”')
    styles = re.findall(r'href="([^"]+\.css)"', (root / 'dist/index.html').read_text(encoding='utf-8'))
    payload = '<script type="module">import("./game-v14.js").catch(error=>window.__ASHEN_WEB__.fail(error));</script>'
    return template.replace('<!--GAME_STYLES-->', ''.join(f'<link rel="stylesheet" href="{name}">' for name in styles)).replace('<!--GAME_PAYLOAD-->', payload)


class GameRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, root=ROOT, **kwargs):
        self.root = root
        super().__init__(*args, directory=str(root / 'dist'), **kwargs)

    def end_headers(self):
        # Old conditional responses can combine pre-update modules with new ones.
        # Preserve ordinary image caching; never clear origin storage or game saves.
        path = unquote(urlsplit(self.path).path)
        if path in ('/', '/index.html') or path.endswith(('.js', '.mjs', '.css')):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        try:
            if path in ('/', '/index.html'):
                body = launcher(self.root).encode('utf-8')
                content_type = 'text/html; charset=utf-8'
            elif path.count('/') == 1 and path.endswith('.js'):
                source = (self.root / 'dist' / path[1:]).read_text(encoding='utf-8')
                body = prepare_module(path[1:], source).encode('utf-8')
                content_type = 'text/javascript; charset=utf-8'
            else:
                if path.endswith(('.mjs', '.css')):
                    del self.headers['If-Modified-Since']
                return super().send_head()
        except FileNotFoundError:
            self.send_error(404, 'File not found')
            return None
        except (OSError, ValueError) as error:
            self.log_error('Loading preparation failed: %s', error)
            self.send_error(500, 'Game loading preparation failed; see terminal')
            return None
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        return io.BytesIO(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=5173)
    args = parser.parse_args()
    manifest = ROOT / 'archives/runtime-assets.manifest.json'
    spec = json.loads(manifest.read_text(encoding='utf-8'))
    missing = [entry['path'] for entry in spec['files'] if not (ROOT / spec['restore_directory'] / entry['path']).is_file()]
    if missing:
        print('正在还原首次运行所需的原始图片…', flush=True)
        restore(manifest)
    # Existing assets and source files remain untouched; edited code is read per request.
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(GameRequestHandler, root=ROOT))
    print('Ashen: http://127.0.0.1:' + str(server.server_port), flush=True)
    print('请保持此终端运行。网页会显示加载进度；更新代码后刷新即可，存档保留。', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
