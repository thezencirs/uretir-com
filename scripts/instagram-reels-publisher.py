#!/usr/bin/env python3
"""
Üretir AI (@uretirai) Instagram Reels Otomatik Yükleyici
Yüksek yıldızlı açık kaynak 'instagrapi' kütüphanesini kullanır.
"""
import os
import sys
from pathlib import Path

def main():
    if len(sys.argv) < 4:
        print("Kullanım: instagram-reels-publisher.py <video_mp4> <cover_png> <caption>")
        return 0

    video_path = Path(sys.argv[1])
    cover_path = Path(sys.argv[2])
    caption = sys.argv[3]

    username = os.environ.get("IG_USERNAME", "uretirai").strip().lstrip("@")
    password = os.environ.get("IG_PASSWORD", "").strip()
    session_file = Path("reports/social-media/ig_session.json")

    if not password:
        print("IG_PASSWORD ortam değişkeni tanımlı değil; yükleme atlandı.")
        return 0

    try:
        from instagrapi import Client
    except ImportError:
        print("instagrapi kurulu değil (pip install instagrapi moviepy pillow).")
        return 0

    try:
        cl = Client()
        cl.delay_range = [2, 5]
        if session_file.exists():
            try:
                cl.load_settings(session_file)
            except Exception:
                pass

        cl.login(username, password)
        session_file.parent.mkdir(parents=True, exist_ok=True)
        cl.dump_settings(session_file)

        media = cl.clip_upload(
            path=str(video_path),
            caption=caption,
            thumbnail=str(cover_path) if cover_path.exists() else None,
        )
        print(f"PUBLISHED_OK pk={getattr(media, 'pk', 'unknown')}")
        return 0
    except Exception as exc:
        print(f"IG_UPLOAD_NOTICE: {exc}")
        return 0

if __name__ == "__main__":
    raise SystemExit(main())
