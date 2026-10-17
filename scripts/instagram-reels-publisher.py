#!/usr/bin/env python3
"""
Üretir AI (@uretirai) Instagram Reels, Post & Story Otomatik Yayınlayıcı
Yüksek yıldızlı açık kaynak 'subzeroid/instagrapi' (5.5k+ ⭐) kütüphanesini kullanır.
Hedef: uretir.com veri merkezine sosyal medyadan organik trafik çekmek.
"""
import json
import os
import sys
from pathlib import Path

local_instagrapi = Path(".local/open-source-stack/repos/instagrapi").resolve()
if local_instagrapi.exists():
    sys.path.insert(0, str(local_instagrapi))


def main():
    if len(sys.argv) < 4:
        print("Kullanım: instagram-reels-publisher.py <video_mp4> <cover_png> <caption>")
        return 0

    video_path = Path(sys.argv[1]) if sys.argv[1] else None
    cover_path = Path(sys.argv[2])
    caption = sys.argv[3]

    username = os.environ.get("IG_USERNAME", "uretirai").strip().lstrip("@")
    password = os.environ.get("IG_PASSWORD", "").strip()
    session_file = Path("reports/social-media/ig_session.json")
    sessionid_file = Path("reports/social-media/ig_sessionid.txt")
    result_file = Path("reports/social-media/ig_last_publish.json")

    if not password and not sessionid_file.exists():
        print("IG_PASSWORD ortam değişkeni tanımlı değil; yükleme atlandı.")
        return 0

    try:
        from instagrapi import Client
        from PIL import Image
    except ImportError as exc:
        print(f"instagrapi veya Pillow kurulu değil: {exc}")
        return 0

    jpg_cover_path = cover_path.with_suffix(".jpg")
    if cover_path.exists():
        try:
            with Image.open(cover_path) as im:
                rgb_im = im.convert("RGB")
                rgb_im.save(jpg_cover_path, "JPEG", quality=94)
        except Exception as e:
            print(f"Kapak JPEG dönüştürme uyarısı: {e}")

    try:
        cl = Client()
        cl.delay_range = [2, 4]
        logged_in = False

        # 1. Try existing instagrapi session file
        if session_file.exists():
            try:
                cl.load_settings(session_file)
                cl.account_info()
                logged_in = True
                print("SESSION_REUSED_OK")
            except Exception:
                cl = Client()
                cl.delay_range = [2, 4]

        # 2. Try sessionid from IG_SESSIONID env or ig_sessionid.txt
        if not logged_in:
            from urllib.parse import unquote
            raw_sid = os.environ.get("IG_SESSIONID", "").strip()
            if not raw_sid and sessionid_file.exists():
                raw_sid = sessionid_file.read_text(encoding="utf-8").strip()
            sid = unquote(raw_sid)
            if len(sid) > 20:
                try:
                    logged_in = bool(cl.login_by_sessionid(sid))
                    if logged_in:
                        print("SESSIONID_LOGIN_OK")
                except Exception as sid_exc:
                    print(f"SESSIONID_NOTICE: {sid_exc}")

        # 3. Try Bloks CAA Login and inspect outcome directly
        if not logged_in and password:
            cl.username = username
            cl.password = password
            try:
                outcome = cl.bloks_caa_login()
                if outcome.get("logged_in"):
                    cl.login_flow()
                    logged_in = True
                    print("CAA_BLOKS_LOGIN_OK")
                else:
                    markers = cl._caa_result_action_markers(outcome)
                    print(f"CAA_LOGIN_MARKERS: {markers} reason={outcome.get('reason')}")
            except Exception as caa_exc:
                print(f"CAA_LOGIN_NOTICE: {caa_exc}")

        if not logged_in:
            print("IG_LOGIN_PENDING: Browser sessionid or challenge resolution needed.")
            return 0

        session_file.parent.mkdir(parents=True, exist_ok=True)
        cl.dump_settings(session_file)

        # Ensure bio & external_url point to uretir.com for traffic funneling
        try:
            acct = cl.account_info()
            current_url = getattr(acct, "external_url", "") or ""
            if "uretir.com" not in current_url.lower():
                cl.account_edit(
                    external_url="https://www.uretir.com",
                    biography=(
                        "🇹🇷 Türkiye Üretir, Gençler Yetişir!\n"
                        "🤖 6 Canlı Yapay Zekâ Aracı: HaberAI · FinansAI · İndirimAI · PuanAI · ArabaAI · EvAI\n"
                        "👇 Canlı Veriler ve İndirim Radarı:"
                    ),
                )
                print("BIO_UPDATED_OK https://www.uretir.com")
        except Exception as bio_exc:
            print(f"BIO_CHECK_NOTICE: {bio_exc}")

        published_items = []

        # 1. Publish 9:16 Vertical Motion-Graphic Reel (with natural Turkish voiceover)
        if video_path and video_path.exists():
            try:
                thumb = str(jpg_cover_path) if jpg_cover_path.exists() else None
                media = cl.clip_upload(
                    path=str(video_path),
                    caption=caption,
                    thumbnail=thumb,
                )
                pk = str(getattr(media, "pk", ""))
                code = str(getattr(media, "code", ""))
                reel_url = f"https://www.instagram.com/reel/{code}/" if code else f"pk:{pk}"
                published_items.append({"type": "reel", "pk": pk, "code": code, "url": reel_url})
                print(f"PUBLISHED_OK type=reel pk={pk} code={code} url={reel_url}")
            except Exception as reel_exc:
                print(f"REEL_UPLOAD_NOTICE: {reel_exc}")

        # 2. Fallback / Companion Photo Post
        if not published_items and jpg_cover_path.exists():
            try:
                media = cl.photo_upload(
                    path=str(jpg_cover_path),
                    caption=caption,
                )
                pk = str(getattr(media, "pk", ""))
                code = str(getattr(media, "code", ""))
                post_url = f"https://www.instagram.com/p/{code}/" if code else f"pk:{pk}"
                published_items.append({"type": "photo", "pk": pk, "code": code, "url": post_url})
                print(f"PUBLISHED_OK type=photo pk={pk} code={code} url={post_url}")
            except Exception as photo_exc:
                print(f"PHOTO_UPLOAD_NOTICE: {photo_exc}")

        # 3. Also publish to Instagram Story with uretir.com link sticker
        if jpg_cover_path.exists():
            try:
                from instagrapi.types import StoryLink
                story = cl.photo_upload_to_story(
                    path=str(jpg_cover_path),
                    caption="Canlı veriler için: https://www.uretir.com",
                    links=[StoryLink(webUri="https://www.uretir.com", x=0.5, y=0.85, width=0.6, height=0.08)],
                )
                s_pk = str(getattr(story, "pk", ""))
                published_items.append({"type": "story", "pk": s_pk})
                print(f"PUBLISHED_OK type=story pk={s_pk}")
            except Exception as story_exc:
                print(f"STORY_UPLOAD_NOTICE: {story_exc}")

        result_file.parent.mkdir(parents=True, exist_ok=True)
        result_file.write_text(
            json.dumps(
                {
                    "username": username,
                    "published": published_items,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        return 0
    except Exception as exc:
        print(f"IG_UPLOAD_NOTICE: {exc}")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
