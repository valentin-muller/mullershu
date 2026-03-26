#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ASSETS_DIR = Path("assets")
OUTPUT_DIR = Path("images")
MAX_WIDTH = 1920
VALID_EXTS = {".jpg", ".jpeg", ".png"}


def process_image(src: Path, dst: Path) -> None:
    with Image.open(src) as img:
        original_width, original_height = img.size
        if original_width > MAX_WIDTH:
            new_height = int((MAX_WIDTH / original_width) * original_height)
            img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)
        else:
            new_height = original_height

        dst.parent.mkdir(parents=True, exist_ok=True)

        save_kwargs = {"optimize": True, "quality": 80}
        ext = src.suffix.lower()
        if ext in {".jpg", ".jpeg"}:
            if img.mode in {"RGBA", "P", "LA"}:
                img = img.convert("RGB")
        elif ext == ".png":
            save_kwargs["compress_level"] = 6

        img.save(dst, **save_kwargs)

        resized_width, resized_height = img.size
        print(
            f"Saved: {src} -> {dst} "
            f"({original_width}x{original_height} -> {resized_width}x{resized_height})"
        )


def main() -> None:
    if not ASSETS_DIR.exists():
        print("assets directory not found")
        return

    for path in ASSETS_DIR.rglob("*"):
        if path.is_file() and path.suffix.lower() in VALID_EXTS:
            rel_path = path.relative_to(ASSETS_DIR)
            dest_path = OUTPUT_DIR / rel_path
            process_image(path, dest_path)


if __name__ == "__main__":
    main()
