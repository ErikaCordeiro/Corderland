import json
import re
import unittest
from app import app, PROJECT_SLUGS


class SiteTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_and_existing_api(self):
        self.assertEqual(self.client.get('/health').json['status'], 'ok')
        site = self.client.get('/api/site').json
        self.assertEqual(len(site['services']), 6)
        self.assertEqual([p['name'] for p in site['projects']], ['Fluxonland', 'Hey Dev', 'Lua Active', 'Fitland'])
        self.assertEqual(site['whatsapp']['waMe'], 'https://wa.me/5548988006788')

    def test_home_and_project_metadata(self):
        for route in ['/', *['/projetos/' + slug for slug in PROJECT_SLUGS]]:
            with self.subTest(route=route):
                response = self.client.get(route)
                self.assertEqual(response.status_code, 200)
                html = response.get_data(as_text=True)
                self.assertIn('lang="pt-BR"', html)
                self.assertIn('property="og:description"', html)
                self.assertIn('rel="canonical"', html)
                self.assertNotIn('type="text/babel"', html)
                match = re.search(r'window.__PROJECT_SLUG__ = (.*?);', html)
                self.assertEqual(json.loads(match.group(1)), route.split('/')[-1] if route != '/' else None)

    def test_unknown_project_is_not_silently_served(self):
        self.assertEqual(self.client.get('/projetos/unknown').status_code, 404)
        self.assertEqual(self.client.get('/projetos/../app.py').status_code, 404)

    def test_fitland_direct_route_refresh_and_metadata(self):
        for _ in range(2):
            response = self.client.get('/projetos/fitland')
            self.assertEqual(response.status_code, 200)
            html = response.get_data(as_text=True)
            self.assertIn('Fitland — Tecnologia que transforma o acompanhamento de treinos.', html)
            self.assertIn('https://corderland.onrender.com/projetos/fitland', html)
            self.assertIn('window.__PROJECT_SLUG__ = "fitland"', html)
        project = self.client.get('/api/site').json['projects'][-1]
        self.assertEqual(project['slug'], 'fitland')
        self.assertEqual(len(project['features']), 6)
        self.assertEqual(project['url'], 'https://fitland.up.railway.app')
        self.assertNotIn('IA', ' '.join(project['items']))

    def test_fitland_local_capture_and_styles(self):
        capture = self.client.get('/api/site').json['projects'][-1]['capture']
        with self.client.get(capture['src']) as response:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.mimetype, 'image/jpeg')
            self.assertTrue(response.get_data().startswith(b'\xff\xd8'))
        with self.client.get('/static/css/fitland.css') as response:
            self.assertEqual(response.status_code, 200)

    def test_all_local_template_assets_resolve(self):
        html = self.client.get('/').get_data(as_text=True)
        assets = re.findall(r'(?:src|href)="(/static/[^"]+)"', html)
        self.assertEqual(len(assets), 7)
        for asset in assets:
            with self.subTest(asset=asset):
                with self.client.get(asset) as response:
                    self.assertEqual(response.status_code, 200)
        with self.client.get('/static/css/brand-chat.css') as response:
            self.assertEqual(response.status_code, 200)

    def test_branding_icons_and_social_image(self):
        html = self.client.get('/').get_data(as_text=True)
        self.assertIn('property="og:image"', html)
        self.assertIn('rel="apple-touch-icon"', html)
        with self.client.get('/favicon.ico') as response:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_data()[:4], b'\x00\x00\x01\x00')
        for size in (32, 64, 128, 180, 256, 512):
            with self.client.get(f'/static/images/brand/coderland-logo-{size}.png') as response:
                self.assertEqual(response.status_code, 200)
                png = response.get_data()
                self.assertEqual(png[:8], b'\x89PNG\r\n\x1a\n')
                self.assertEqual(int.from_bytes(png[16:20], 'big'), size)
                self.assertEqual(png[25], 6)  # RGBA with a real alpha channel

    def test_script_data_is_safely_serialized(self):
        # Jinja tojson escapes HTML delimiters instead of executable script text.
        from flask import render_template
        with app.test_request_context('/'):
            html = render_template('index.html', site={'brand': '</script><script>alert(1)</script>',
                'services': [], 'whatsapp': {'waMe': 'https://wa.me/5548988006788'}},
                title='Test', description='Test', canonical='https://corderland.onrender.com/', project_slug=None)
            self.assertNotIn('</script><script>alert(1)</script>', html)
            self.assertIn('\\u003c/script\\u003e', html)


if __name__ == '__main__':
    unittest.main()
