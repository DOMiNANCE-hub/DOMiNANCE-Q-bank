"""Shrink question images for the web.

Usage: python3 editor/prep-images.py <input folder> <output folder under images/> [max width]
Converts every JPG/PNG/WebP/GIF in the input folder (recursively) to WebP, at most
1200 px wide (default), quality 78, and prints a JSON manifest {name: {src, w, h, kb}}
to use in question "images" fields.
"""
import sys, os, json
from PIL import Image, ImageOps
src, dst = sys.argv[1], sys.argv[2]
maxw = int(sys.argv[3]) if len(sys.argv) > 3 else 1200
os.makedirs(dst, exist_ok=True)
man = {}
for root, _, files in os.walk(src):
    for f in sorted(files):
        if not f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff')):
            continue
        im = ImageOps.exif_transpose(Image.open(os.path.join(root, f))).convert('RGB')
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        name = os.path.splitext(f)[0].lower().replace(' ', '-') + '.webp'
        out = os.path.join(dst, name)
        im.save(out, 'WEBP', quality=78, method=6)
        man[os.path.splitext(f)[0]] = {'src': out.replace(os.sep, '/'), 'w': im.width, 'h': im.height, 'kb': round(os.path.getsize(out) / 1024)}
print(json.dumps(man, indent=1))
