"""Resize the owner-supplied courtyard image without changing the scene.
Run with the Pillow runtime: python optimize-courtyard-photo.py --source PATH
"""
import argparse
from pathlib import Path
from PIL import Image, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True, type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[3]
output = root / 'mullers2-wellness/mellow/assets'
image = ImageOps.exif_transpose(Image.open(args.source)).convert('RGB')
for width in (640, 960, 1280):
    size = (width, round(image.height * width / image.width))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    for extension, options in [('webp', dict(quality=82, method=6)), ('avif', dict(quality=55, speed=6))]:
        path = output / f'courtyard-sunlit-{width}.{extension}'
        resized.save(path, **options)
        print(f'{path.name}: {size[0]}×{size[1]}, {path.stat().st_size} bytes')
