"""Download credited Wikimedia Commons photos for the original noun vocabulary."""

import json
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'frontend/public/media/objects'
QUERIES = {
    'keyboard': 'computer keyboard photograph',
    'headphones': 'headphones photograph',
    'screen': 'LCD computer monitor photograph',
    'mouse': 'computer mouse photograph',
    'desk': 'wooden office desk furniture photograph',
    'chair': 'office chair photograph',
    'notebook': 'paper notebook photograph',
    'pen': 'ballpoint pen photograph',
    'apple': 'red apple fruit photograph',
    'banana': 'yellow banana fruit photograph',
    'orange': 'orange fruit photograph',
    'grapes': 'fresh grapes fruit bunch photograph',
}
HEADERS = {'User-Agent': 'VocabularyApp/1.0 (educational content; contact: ampiesteven24@gmail.com)'}
SELECTED = {
    'keyboard': [0, 1], 'headphones': [0, 6], 'screen': [2, 3],
    'mouse': [2, 4], 'desk': [1, 4], 'chair': [1, 4],
    'notebook': [0, 1], 'pen': [0, 3], 'apple': [0, 5],
    'banana': [0, 4], 'orange': [2, 3], 'grapes': [2, 3],
}


def strip_html(value):
    return re.sub(r'<[^>]+>', '', value or '').strip()


def find_photos(item):
    params = {
        'action': 'query', 'generator': 'search', 'gsrsearch': f'filetype:bitmap {QUERIES[item]}',
        'gsrnamespace': '6', 'gsrlimit': '20', 'prop': 'imageinfo',
        'iiprop': 'url|extmetadata|mime|size', 'iiurlwidth': '1000', 'format': 'json',
    }
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=45) as response:
        pages = json.load(response).get('query', {}).get('pages', {})
    results = []
    for page in pages.values():
        info = page.get('imageinfo', [{}])[0]
        meta = info.get('extmetadata', {})
        license_name = strip_html(meta.get('LicenseShortName', {}).get('value', ''))
        title = page.get('title', '')
        if info.get('mime') != 'image/jpeg' or info.get('width', 0) < 500:
            continue
        if not (license_name.startswith('CC') or license_name in ('Public domain', 'PD', 'No restrictions')):
            continue
        if any(part in title.lower() for part in ('logo', 'icon', 'drawing', 'diagram', 'illustration', 'clipart')):
            continue
        results.append({
            'title': title,
            'url': info.get('thumburl') or info.get('url'),
            'creditUrl': info.get('descriptionurl'),
            'creator': strip_html(meta.get('Artist', {}).get('value', 'Unknown'))[:120],
            'license': license_name,
        })
    return item, sorted(results, key=lambda photo: len(photo['title']))[:8]


def main():
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = dict(pool.map(find_photos, QUERIES))
    (ROOT / 'content').mkdir(exist_ok=True)
    manifest = {}
    jobs = []
    for item, indices in SELECTED.items():
        manifest[item] = []
        for number, index in enumerate(indices, 1):
            photo = results[item][index]
            src = f'/media/objects/{item}/{number}.jpg'
            manifest[item].append({key: photo[key] for key in ('creditUrl', 'creator', 'license')} | {'src': src})
            jobs.append((item, number, photo['url']))

    def download(job):
        item, number, url = job
        destination = OUT / item / f'{number}.jpg'
        destination.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(request, timeout=60) as response:
            image = Image.open(BytesIO(response.read())).convert('RGB')
        image.thumbnail((960, 960))
        image.save(destination, 'JPEG', quality=82, optimize=True)
        return f'{item}/{number}.jpg ({destination.stat().st_size} bytes)'

    with ThreadPoolExecutor(max_workers=4) as pool:
        for line in pool.map(download, jobs):
            print(line)
    (ROOT / 'content/noun-images.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
    credits = ['# Créditos de fotografías de objetos', '', 'Fotografías de Wikimedia Commons. Cada ficha de la aplicación también muestra el crédito de la imagen activa.', '']
    for item, photos in manifest.items():
        for number, photo in enumerate(photos, 1):
            credits.append(f"- **{item.title()} {number}:** [{photo['creator']}]({photo['creditUrl']}) — {photo['license']}.")
    (ROOT / 'content/OBJECT_IMAGE_CREDITS.md').write_text('\n'.join(credits) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
