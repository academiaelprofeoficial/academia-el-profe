"""
Fix logo: Use ORIGINAL LOGO WEB.png (1624x609, wide/horizontal) instead of
the cropped portrait version (480x605). 

Steps:
1. Remove white background (distance-based from ~254,254,254)
2. Create light-mode version: text in BLACK
3. Create dark-mode version: text in WHITE  
4. Save as WebP quality=100, full resolution (no downscale)
"""

from PIL import Image
import numpy as np

SRC = 'upload/LOGO WEB.png'
OUT_LIGHT = 'public/images/logo-academia-dark.webp'   # shown in light mode (dark text)
OUT_DARK  = 'public/images/logo-academia.webp'        # shown in dark mode (white text)

# Load
img = Image.open(SRC).convert('RGBA')
arr = np.array(img)
h, w = arr.shape[:2]
print(f"Original: {w}x{h}")

r = arr[:,:,0].astype(np.float64)
g = arr[:,:,1].astype(np.float64)
b = arr[:,:,2].astype(np.float64)
a = arr[:,:,3].copy()

# 1. Remove white background
# Background color is approximately (254, 254, 254)
# Use Euclidean distance in RGB space
dist_to_white = np.sqrt((r - 254)**2 + (g - 254)**2 + (b - 254)**2)
bg_mask = dist_to_white < 5

# Soft edge: gradual alpha for pixels near the threshold (anti-aliasing)
soft_zone = (dist_to_white >= 5) & (dist_to_white < 8)
a[bg_mask] = 0
# Smooth transition at edges
a[soft_zone] = np.clip(255 * (1 - (dist_to_white[soft_zone] - 5) / 3), 0, 255).astype(np.uint8)

print(f"Background pixels removed: {np.sum(bg_mask)}")
print(f"Soft edge pixels: {np.sum(soft_zone)}")

# 2. Identify text pixels (dark blue: R~0, G~13, B~42)
# The text "ACADEMIA EL PROFE" is in this dark blue color
text_mask = (r < 10) & (g < 30) & (g > 0) & (b > 20) & (b < 70) & (a > 128)
print(f"Text pixels identified: {np.sum(text_mask)}")

# 3. Create LIGHT MODE version (black text)
arr_light = arr.copy()
arr_light[:,:,3] = a
# Change text from dark blue to pure black
arr_light[text_mask, 0] = 0
arr_light[text_mask, 1] = 0
arr_light[text_mask, 2] = 0

img_light = Image.fromarray(arr_light)
img_light.save(OUT_LIGHT, 'WEBP', quality=100, method=6)
print(f"Saved light mode: {OUT_LIGHT} ({img_light.size})")

# 4. Create DARK MODE version (white text)
arr_dark = arr.copy()
arr_dark[:,:,3] = a
# Change text from dark blue to pure white
arr_dark[text_mask, 0] = 255
arr_dark[text_mask, 1] = 255
arr_dark[text_mask, 2] = 255

img_dark = Image.fromarray(arr_dark)
img_dark.save(OUT_DARK, 'WEBP', quality=100, method=6)
print(f"Saved dark mode: {OUT_DARK} ({img_dark.size})")

print("\nDone! Both logos are now 1624x609 (horizontal/landscape) with transparent background.")