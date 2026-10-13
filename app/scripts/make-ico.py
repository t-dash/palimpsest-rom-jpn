"""favicon.ico (16/32/48) from icon-512.png, and og.png shrunk under 300 KB.
Run after scripts/make-brand.mjs:  python scripts/make-ico.py   (needs Pillow)"""
import os
from PIL import Image

Image.open("public/icon-512.png").save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
og = Image.open("public/og.png").convert("RGB")
og.quantize(colors=128, method=Image.Quantize.MEDIANCUT).save("public/og.png", optimize=True)
print("og.png", os.path.getsize("public/og.png") // 1024, "KB")
