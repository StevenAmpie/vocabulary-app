"""Apply manually reviewed Wikimedia photo choices to the verb catalog."""

import json
import sys
from pathlib import Path
from urllib.parse import unquote

import requests

from build_verb_catalog import API, GOOD_LICENSE, HEADERS, MEDIA, ROOT, plain, save_photo

CHOICES = {
    "run": ["Woman runs through mud.jpg", "Old person running 2015.jpeg"],
    "walk": ["People walking on the street in Nairobi, Kenya.jpg", "Mother and child walking down the sidewalk on an unidentified street.jpg"],
    "jump": ["Trampoline jump king.JPG", "Girls silhouette on wall child is bouncing on a trampoline.jpg"],
    "swim": ["Swimming in Arrábida Natural Park.jpg", "Swimmer in Rydal Water - geograph.org.uk - 5749175.jpg"],
    "drive": ["Old woman driving blue car (Unsplash).jpg", "Woman smiles while driving.jpg"],
    "draw": ["A cartoonist drawing-Disney's Hollywood Studios (May 2023).JPG", "Aa education collins drawing class.JPG"],
    "paint": ["President Bill Clinton paints a wall with a roller paint brush during the renovation of Cardozo High School in Washington, DC.jpg", "Pattachitra artist at work in Odisha, India.jpg"],
    "sing": ["Asasobi singing Kaikai Kitan on the stage 20240714b.jpg", "Mans Z singing.jpg"],
    "bake": ["Baking a dish in the oven while taking it out using oven mitts in a cozy kitchen.jpg", "Baker woman's hands kneading bread dough.jpg"],
    "eat": ["People eating food from a cookout.jpg", "Man eating Mission burrito at El Farolito.jpg"],
    "drink": ["Boy drinking water in house.jpg", "Woman drinking water.jpg"],
    "sleep": ["Mother and newborn sleeping on a bamboo bed near a campfire in a house in Don Det Laos.jpg", "Sleeping-girl.jpg"],
    "cry": ["Hilda Dokubo crying 1.jpg", "Weeping Parisian from NARA Ww2-81.jpg"],
    "listen": ["Girl in headphones.jpg", "Woman listening to music with wireless headphones neon light (50810419882).jpg"],
    "point": ["Man pointing with his finger.jpg", "Woman pointing (16775293481).jpg"],
    "hit": ["Stacey Brinson hits the ball with her racket as she prepares to take part in the tennis competition during the Special Olympics at Coonskin Park in Charleston, W.Va., June 4, 2011 110604-F-NH898-009.jpg", "Samuele Bruno Hitting.webp"],
    "push": ["Person collecting recyclables, pushing a cart on the road in Ebisu.jpg", "AMISH HOUSEWIFE PUSHES SHOPPING CART OF GROCERIES TO HER PARKED HORSE AND BUGGY - NARA - 550094.jpg"],
    "clean": ["Person cleaning a wooden countertop in a bright room using orange cleaning spray and wearing rubber gloves.jpg", "Person cleaning living room floor with vacuum cleaner in modern home.jpg"],
    "cut": ["Man chopping vegetables in a cozy kitchen cabin surrounded by friends cooking together.jpg", "Chef prepares fresh ingredients by chopping red vegetables.jpg"],
    "build": ["House Construction Labour Workers 2 - Invermere, British Columbia.jpg", "House Construction Labour Workers 3 - Invermere, British Columbia.jpg"],
    "fix": ["Car mechanic fixing a damaged part of a car.jpg", "Roadside Car Repair Mechanic at Work.jpg"],
    "carry": ["Man carrying boxes on a bicycle.jpg", "Girl carrying her father's lunch pail, Omaha 10439u.jpg"],
    "talk": ["Petra, People in conversation, Jordan.jpg", "People having conversation in happy mood.jpg"],
    "hold": ["A person holding basket ball in his hand.JPG", "Close-up of a person holding 3 apples on top of eachother.jpg"],
    "play": ["A group of young people playing ball, Ismailia, Egypt.jpg", "People Playing football.jpg"],
}


def exact_photo(title: str) -> dict:
    params = {
        "action": "query", "titles": "File:" + title,
        "prop": "imageinfo", "iiprop": "url|extmetadata|size",
        "iiurlwidth": 640, "format": "json",
    }
    response = requests.get(API, params=params, headers=HEADERS, timeout=35)
    response.raise_for_status()
    page = next(iter(response.json()["query"]["pages"].values()))
    info = page["imageinfo"][0]
    meta = info["extmetadata"]
    license_name = plain(meta.get("LicenseShortName", {}).get("value", ""))
    if not GOOD_LICENSE.match(license_name):
        raise ValueError(f"Disallowed license for {title}: {license_name}")
    return {
        "title": title,
        "url": info.get("thumburl") or info["url"],
        "creditUrl": info["descriptionurl"],
        "creator": plain(meta.get("Artist", {}).get("value", "Unknown"))[:160] or "Unknown",
        "license": license_name,
    }


def main() -> None:
    path = ROOT / "content" / "verbs.json"
    records = json.loads(path.read_text(encoding="utf-8"))
    for record in records:
        if record["slug"] == "wake":
            record.update(slug="hold", termEn="Hold", translationEs="sostener", phoneticIpa="/hoʊld/", hint="Observa qué hace alguien con un objeto entre las manos.", imageDescription="Fotografía de alguien que sostiene un objeto.", exampleEn="She holds the ball.", exampleEs="Ella sostiene la pelota.", audioUrl="/media/verbs/hold/audio.wav")
        elif record["slug"] == "close":
            record.update(slug="play", termEn="Play", translationEs="jugar", phoneticIpa="/pleɪ/", hint="Observa la actividad compartida y piensa en un verbo de diversión.", imageDescription="Fotografía de personas que juegan.", exampleEn="The children play outside.", exampleEs="Los niños juegan afuera.", audioUrl="/media/verbs/play/audio.wav")
        slug = record["slug"]
        if len(sys.argv) > 1 and slug not in sys.argv[1:]:
            continue
        if slug not in CHOICES:
            continue
        directory = MEDIA / slug
        directory.mkdir(parents=True, exist_ok=True)
        images = []
        for index, title in enumerate(CHOICES[slug], 1):
            try:
                candidate = exact_photo(title)
                save_photo(candidate, directory / f"{index}.jpg")
                images.append({key: candidate[key] for key in ("creditUrl", "creator", "license") } | {"src": f"/media/verbs/{slug}/{index}.jpg"})
            except Exception as exc:
                print(f"ERROR {slug} {index}: {exc}", flush=True)
        if len(images) == 2:
            record["images"] = images
        print(f"{slug}: {len(images)} replacements", flush=True)
    path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Créditos de fotografías", "", "Fotografías descargadas de Wikimedia Commons. La licencia de cada archivo se indica en su página de origen.", ""]
    for record in records:
        for i, image in enumerate(record["images"], 1):
            lines.append(f"- **{record['termEn']} {i}:** [{image['creator']}]({image['creditUrl']}) — {image['license']}.")
    (ROOT / "content" / "IMAGE_CREDITS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"TOTAL {len(records)} verbs; {sum(len(row['images']) for row in records)} photos", flush=True)


if __name__ == "__main__":
    main()
