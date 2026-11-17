"""Curate local verb photographs from Wikimedia Commons with recorded licenses.

Run with ``py -3 content/build_verb_catalog.py``. The generated JSON and JPEGs
are checked into Git so deployment does not depend on Wikimedia at runtime.
"""

from __future__ import annotations

import html
import io
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "frontend" / "public" / "media" / "verbs"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "VocabularyApp/1.0 (educational photo curation; contact: ampiesteven24@gmail.com)"}

# slug, translation, American IPA, descriptive search, usage example, Spanish example
VERBS = [
    ("run", "correr", "/rʌn/", "woman running outdoors", "She runs in the park.", "Ella corre en el parque."),
    ("walk", "caminar", "/wɔːk/", "people walking street", "We walk to school.", "Caminamos a la escuela."),
    ("jump", "saltar", "/dʒʌmp/", "person jumping outdoors", "The child jumps high.", "El niño salta alto."),
    ("swim", "nadar", "/swɪm/", "person swimming pool", "I swim every weekend.", "Nado cada fin de semana."),
    ("ride", "montar", "/raɪd/", "person riding bicycle", "He rides a bicycle.", "Él monta una bicicleta."),
    ("drive", "conducir", "/draɪv/", "person driving car", "She drives to work.", "Ella conduce al trabajo."),
    ("fly", "volar", "/flaɪ/", "bird flying sky", "The bird flies above us.", "El pájaro vuela sobre nosotros."),
    ("climb", "escalar", "/klaɪm/", "person climbing mountain", "They climb the mountain.", "Ellos escalan la montaña."),
    ("dance", "bailar", "/dæns/", "people dancing", "We dance together.", "Bailamos juntos."),
    ("sing", "cantar", "/sɪŋ/", "woman singing microphone", "She sings beautifully.", "Ella canta de forma hermosa."),
    ("read", "leer", "/riːd/", "woman reading book", "I read a book at night.", "Leo un libro por la noche."),
    ("write", "escribir", "/raɪt/", "person writing notebook", "He writes a letter.", "Él escribe una carta."),
    ("draw", "dibujar", "/drɔː/", "person drawing paper", "She draws a picture.", "Ella dibuja una imagen."),
    ("paint", "pintar", "/peɪnt/", "person painting canvas", "They paint a landscape.", "Ellos pintan un paisaje."),
    ("cook", "cocinar", "/kʊk/", "person cooking kitchen", "I cook dinner.", "Cocino la cena."),
    ("bake", "hornear", "/beɪk/", "person baking bread", "She bakes fresh bread.", "Ella hornea pan fresco."),
    ("eat", "comer", "/iːt/", "person eating meal", "We eat lunch together.", "Almorzamos juntos."),
    ("drink", "beber", "/drɪŋk/", "person drinking water", "He drinks water.", "Él bebe agua."),
    ("sleep", "dormir", "/sliːp/", "person sleeping bed", "The baby sleeps well.", "El bebé duerme bien."),
    ("hold", "sostener", "/hoʊld/", "person holding object hands", "She holds the ball.", "Ella sostiene la pelota."),
    ("sit", "sentarse", "/sɪt/", "person sitting chair", "Please sit here.", "Por favor, siéntate aquí."),
    ("stand", "estar de pie", "/stænd/", "person standing outdoors", "They stand in line.", "Ellos están de pie en la fila."),
    ("laugh", "reír", "/læf/", "people laughing", "The friends laugh together.", "Los amigos ríen juntos."),
    ("smile", "sonreír", "/smaɪl/", "person smiling portrait", "She smiles at the camera.", "Ella sonríe a la cámara."),
    ("cry", "llorar", "/kraɪ/", "person crying tears", "The child cries softly.", "El niño llora suavemente."),
    ("talk", "hablar", "/tɔːk/", "people talking conversation", "We talk after class.", "Hablamos después de clase."),
    ("listen", "escuchar", "/ˈlɪsən/", "person listening music headphones", "He listens to music.", "Él escucha música."),
    ("watch", "mirar", "/wɑːtʃ/", "people watching television", "They watch a movie.", "Ellos miran una película."),
    ("look", "observar", "/lʊk/", "person looking binoculars", "Look at the sky.", "Mira el cielo."),
    ("point", "señalar", "/pɔɪnt/", "person pointing finger", "She points to the map.", "Ella señala el mapa."),
    ("throw", "lanzar", "/θroʊ/", "person throwing ball", "He throws the ball.", "Él lanza la pelota."),
    ("catch", "atrapar", "/kætʃ/", "person catching ball", "She catches the ball.", "Ella atrapa la pelota."),
    ("kick", "patear", "/kɪk/", "person kicking soccer ball", "He kicks the ball.", "Él patea la pelota."),
    ("hit", "golpear", "/hɪt/", "person hitting baseball", "She hits the ball.", "Ella golpea la pelota."),
    ("push", "empujar", "/pʊʃ/", "person pushing cart", "He pushes the cart.", "Él empuja el carrito."),
    ("pull", "halar", "/pʊl/", "person pulling rope", "They pull the rope.", "Ellos halan la cuerda."),
    ("open", "abrir", "/ˈoʊpən/", "person opening door", "I open the door.", "Abro la puerta."),
    ("play", "jugar", "/pleɪ/", "people playing ball", "The children play outside.", "Los niños juegan afuera."),
    ("wash", "lavar", "/wɑːʃ/", "person washing hands", "Wash your hands.", "Lávate las manos."),
    ("clean", "limpiar", "/kliːn/", "person cleaning house", "He cleans the room.", "Él limpia la habitación."),
    ("brush", "cepillar", "/brʌʃ/", "person brushing teeth", "I brush my teeth.", "Me cepillo los dientes."),
    ("cut", "cortar", "/kʌt/", "person cutting vegetables", "She cuts the vegetables.", "Ella corta las verduras."),
    ("build", "construir", "/bɪld/", "people building house", "They build a house.", "Ellos construyen una casa."),
    ("fix", "reparar", "/fɪks/", "person fixing bicycle", "He fixes the bicycle.", "Él repara la bicicleta."),
    ("carry", "cargar", "/ˈkæri/", "person carrying boxes", "She carries the boxes.", "Ella carga las cajas."),
    ("lift", "levantar", "/lɪft/", "person lifting weights", "He lifts the box.", "Él levanta la caja."),
    ("buy", "comprar", "/baɪ/", "person buying groceries", "We buy fresh fruit.", "Compramos fruta fresca."),
    ("sell", "vender", "/sel/", "person selling market", "They sell flowers.", "Ellos venden flores."),
    ("teach", "enseñar", "/tiːtʃ/", "teacher teaching classroom", "She teaches English.", "Ella enseña inglés."),
    ("learn", "aprender", "/lɝːn/", "students learning classroom", "We learn a new word.", "Aprendemos una palabra nueva."),
]

BAD_TITLE = re.compile(r"poster|logo|icon|drawing|painting|illustrat|cartoon|comic|statue|sculpture|map|diagram|cover|advert|film|movie|video|album|screenshot|certificate|book page|flag|stamp|symbol|graphic|nebula|galaxy|runway", re.I)
GOOD_LICENSE = re.compile(r"^(CC0|CC BY|Public domain|PD|PDM)", re.I)


def plain(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def photo_candidates(query: str) -> list[dict]:
    params = {
        "action": "query", "generator": "search", "gsrsearch": query,
        "gsrnamespace": 6, "gsrlimit": 30, "prop": "imageinfo",
        "iiprop": "url|extmetadata|size", "iiurlwidth": 640, "format": "json",
    }
    response = requests.get(API, params=params, headers=HEADERS, timeout=35)
    response.raise_for_status()
    pages = sorted(response.json().get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 999))
    candidates = []
    for page in pages:
        title = page.get("title", "")
        info = page.get("imageinfo", [{}])[0]
        meta = info.get("extmetadata", {})
        license_name = plain(meta.get("LicenseShortName", {}).get("value", ""))
        if not GOOD_LICENSE.match(license_name) or BAD_TITLE.search(title):
            continue
        if not title.lower().endswith((".jpg", ".jpeg", ".webp", ".png")):
            continue
        if info.get("width", 0) < 400 or info.get("height", 0) < 300:
            continue
        url = info.get("thumburl") or info.get("url")
        if not url:
            continue
        candidates.append({
            "url": url,
            "creditUrl": info.get("descriptionurl", ""),
            "creator": plain(meta.get("Artist", {}).get("value", "Unknown"))[:160] or "Unknown",
            "license": license_name,
            "title": title,
        })
    return candidates


def save_photo(candidate: dict, path: Path) -> None:
    response = requests.get(candidate["url"], headers=HEADERS, timeout=40)
    response.raise_for_status()
    image = Image.open(io.BytesIO(response.content))
    image = ImageOps.exif_transpose(image).convert("RGB")
    image.thumbnail((800, 800))
    image.save(path, "JPEG", quality=82, optimize=True)


def build_one(data: tuple[str, ...]) -> tuple[dict, list[str]]:
    slug, translation, ipa, query, example_en, example_es = data
    directory = MEDIA / slug
    directory.mkdir(parents=True, exist_ok=True)
    diagnostics = []
    candidates = []
    for search in [query, f"{query} photo", f"{slug} action person"]:
        try:
            candidates.extend(photo_candidates(search))
        except Exception as exc:
            diagnostics.append(f"{search}: {exc}")
        if len(candidates) >= 2:
            break
        time.sleep(0.2)
    images = []
    seen = set()
    for candidate in candidates:
        if candidate["creditUrl"] in seen:
            continue
        path = directory / f"{len(images) + 1}.jpg"
        try:
            save_photo(candidate, path)
        except Exception as exc:
            diagnostics.append(f"download {candidate['title']}: {exc}")
            continue
        seen.add(candidate["creditUrl"])
        images.append({
            "src": f"/media/verbs/{slug}/{len(images) + 1}.jpg",
            "creditUrl": candidate["creditUrl"],
            "creator": candidate["creator"],
            "license": candidate["license"],
        })
        if len(images) == 2:
            break
    return ({
        "slug": slug,
        "termEn": slug.capitalize(),
        "translationEs": translation,
        "phoneticIpa": ipa,
        "hint": f"Observa la acción y piensa en el verbo que significa «{translation}».",
        "imageDescription": f"Fotografía que representa la acción de {translation}.",
        "exampleEn": example_en,
        "exampleEs": example_es,
        "images": images,
        "audioUrl": f"/media/verbs/{slug}/audio.wav",
    }, diagnostics)


def main() -> None:
    records = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(build_one, verb): verb[0] for verb in VERBS}
        for future in as_completed(futures):
            slug = futures[future]
            try:
                record, diagnostics = future.result()
                records.append(record)
                print(f"{slug}: {len(record['images'])} photos", flush=True)
                for diagnostic in diagnostics:
                    print(f"  {diagnostic}", flush=True)
            except Exception as exc:
                print(f"{slug}: FAILED {exc}", flush=True)
    records.sort(key=lambda row: next(i for i, verb in enumerate(VERBS) if verb[0] == row["slug"]))
    (ROOT / "content" / "verbs.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Créditos de fotografías", "", "Fotografías descargadas de Wikimedia Commons. La licencia de cada archivo se indica en su página de origen.", ""]
    for record in records:
        for i, image in enumerate(record["images"], 1):
            lines.append(f"- **{record['termEn']} {i}:** [{image['creator']}]({image['creditUrl']}) — {image['license']}.")
    (ROOT / "content" / "IMAGE_CREDITS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"TOTAL {len(records)} verbs; {sum(len(row['images']) for row in records)} photos", flush=True)


if __name__ == "__main__":
    main()
    # Finish with exact file selections audited for semantic relevance.
    from repair_verb_photos import main as apply_curated_choices

    apply_curated_choices()
