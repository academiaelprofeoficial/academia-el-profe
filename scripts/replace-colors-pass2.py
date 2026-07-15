#!/usr/bin/env python3
"""
Second pass: replace remaining emerald references in complex patterns
(gradients, borders, shadows, focus rings, dark-mode only).
"""

import re
import os

BASE = "/home/z/my-project/src"

SKIP_DIRS = {"ui", "node_modules", ".next", "academia-el-profe"}
SKIP_FILES = {"globals.css", "ThemeColorsProvider.tsx", "ThemeToggle.tsx", "ThemeProvider.tsx"}

def should_process(filepath: str) -> bool:
    rel = os.path.relpath(filepath, BASE)
    parts = rel.split(os.sep)
    if any(p in SKIP_DIRS for p in parts):
        return False
    if any(p in SKIP_FILES for p in parts):
        return False
    if not filepath.endswith(".tsx"):
        return False
    return True

def replace_remaining(content: str) -> str:

    # 1. Gradient buttons: from-emerald-500 to-emerald-600 → from-brand-primary to-brand-primary-hover
    content = re.sub(
        r'from-emerald-500\s+to-emerald-600',
        'from-brand-primary to-brand-primary-hover',
        content
    )
    # hover:from-emerald-600 hover:to-emerald-700
    content = re.sub(
        r'hover:from-emerald-600\s+hover:to-emerald-700',
        'hover:from-brand-primary-hover hover:to-brand-primary-hover',
        content
    )

    # 2. Gradient background: from-emerald-50/80 to-white → from-brand-primary-bg-light/80 to-white
    content = re.sub(
        r'from-emerald-50/80',
        'from-brand-primary-bg-light/80',
        content
    )
    content = re.sub(
        r'dark:from-emerald-950/20',
        'dark:from-brand-primary-darkest/20',
        content
    )
    content = re.sub(
        r'dark:from-emerald-950/30',
        'dark:from-brand-primary-darkest/30',
        content
    )

    # 3. Shadow colors: shadow-emerald-500/25 → shadow-brand-primary/25
    content = re.sub(r'shadow-emerald-500/25', 'shadow-brand-primary/25', content)
    content = re.sub(r'shadow-emerald-500/35', 'shadow-brand-primary/35', content)

    # 4. Focus ring: focus:ring-emerald-500/30 → focus:ring-brand-primary/30
    content = re.sub(r'focus:ring-emerald-500/30', 'focus:ring-brand-primary/30', content)
    content = re.sub(r'focus:ring-emerald-500/40', 'focus:ring-brand-primary/40', content)
    content = re.sub(r'focus-visible:ring-emerald-500/20', 'focus-visible:ring-brand-primary/20', content)

    # 5. Border with opacity: border-emerald-200 dark:border-emerald-800
    content = re.sub(
        r'border-emerald-200\s+dark:border-emerald-800',
        'border-brand-primary/30 dark:border-brand-primary/40',
        content
    )
    content = re.sub(
        r'border-emerald-200/60\s+dark:border-emerald-800/40',
        'border-brand-primary/30 dark:border-brand-primary/40',
        content
    )
    content = re.sub(
        r'dark:border-emerald-700\s+dark:text-emerald-400',
        'dark:border-brand-primary dark:text-brand-primary-text',
        content
    )

    # 6. Standalone dark:text-emerald-400 → dark:text-brand-primary-text
    content = re.sub(r'dark:text-emerald-400\b', 'dark:text-brand-primary-text', content)

    # 7. hover:text-emerald-400 → hover:text-brand-primary-text (in dark mode contexts)
    content = re.sub(r'dark:hover:text-emerald-400\b', 'dark:hover:text-brand-primary-text', content)
    content = re.sub(r'\bhover:text-emerald-400\b', 'hover:text-brand-primary-text', content)

    # 8. hover:bg-emerald-700 (standalone) → hover:bg-brand-primary-hover
    content = re.sub(r'\bhover:bg-emerald-700\b', 'hover:bg-brand-primary-hover', content)

    # 9. accent-emerald-500 → accent-brand-primary
    content = re.sub(r'\baccent-emerald-500\b', 'accent-brand-primary', content)

    # 10. bg-emerald-400 (password strength) → bg-brand-primary
    content = re.sub(r'\bbg-emerald-400\b', 'bg-brand-primary', content)

    # 11. text-emerald-800 dark:text-brand-primary-light-text (already partially replaced)
    # This is fine - text-emerald-800 in light mode. Replace standalone:
    content = re.sub(r'\btext-emerald-800\b', 'text-brand-primary-text', content)

    # 12. shadow-[0_0_0_3px_rgba(16,185,129,0.1)] — keep as is (it's already CSS-based)
    # But we can replace it with a more dynamic version
    # Actually leave these rgba shadows as-is for now; they're in admin page.

    return content


def main():
    count = 0
    files_changed = []

    for root, dirs, files in os.walk(BASE):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            filepath = os.path.join(root, f)
            if not should_process(filepath):
                continue
            try:
                with open(filepath, 'r', encoding='utf-8') as fh:
                    original = fh.read()
                modified = replace_remaining(original)
                if modified != original:
                    with open(filepath, 'w', encoding='utf-8') as fh:
                        fh.write(modified)
                    rel = os.path.relpath(filepath, BASE)
                    files_changed.append(rel)
                    count += 1
            except Exception as e:
                print(f"ERROR: {filepath}: {e}")

    print(f"\n=== Second pass: {count} files ===")
    for f in sorted(files_changed):
        print(f"  ✓ {f}")

if __name__ == "__main__":
    main()