#!/usr/bin/env python3
"""
Bulk color replacement script for CMS-driven theme system.
Replaces hardcoded emerald/slate Tailwind classes with brand-* CSS variable classes.
"""

import re
import os

BASE = "/home/z/my-project/src"

# Files to skip (ui components, config files, etc.)
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

def replace_colors(content: str) -> str:
    # ============================================================
    # EMERALD replacements → brand-* classes
    # ============================================================

    # 1. bg-emerald-500 hover:bg-emerald-600 → bg-brand-primary hover:bg-brand-primary-hover
    content = re.sub(
        r'bg-emerald-500\s+hover:bg-emerald-600',
        'bg-brand-primary hover:bg-brand-primary-hover',
        content
    )

    # 2. bg-emerald-500 → bg-brand-primary
    content = re.sub(r'bg-emerald-500\b', 'bg-brand-primary', content)

    # 3. hover:bg-emerald-600 (standalone, not already paired)
    content = re.sub(r'hover:bg-emerald-600\b', 'hover:bg-brand-primary-hover', content)

    # 4. text-emerald-500 → text-brand-primary (icons, accents)
    content = re.sub(r'text-emerald-500\b', 'text-brand-primary', content)

    # 5. text-emerald-600 dark:text-emerald-400 → text-brand-primary-text
    content = re.sub(
        r'text-emerald-600\s+dark:text-emerald-400',
        'text-brand-primary-text',
        content
    )
    # Standalone text-emerald-600
    content = re.sub(r'text-emerald-600\b', 'text-brand-primary-text', content)

    # 6. text-emerald-700 dark:text-emerald-400 → text-brand-primary-text
    content = re.sub(
        r'text-emerald-700\s+dark:text-emerald-400',
        'text-brand-primary-text',
        content
    )
    # Standalone text-emerald-700
    content = re.sub(r'\btext-emerald-700\b', 'text-brand-primary-text', content)

    # 7. bg-emerald-100 dark:bg-emerald-900/50 → bg-brand-primary-bg
    content = re.sub(
        r'bg-emerald-100\s+dark:bg-emerald-900/50',
        'bg-brand-primary-bg',
        content
    )
    # Standalone bg-emerald-100
    content = re.sub(r'bg-emerald-100\b', 'bg-brand-primary-bg', content)

    # 8. bg-emerald-50 dark:bg-emerald-950/40 → bg-brand-primary-bg-light
    content = re.sub(
        r'bg-emerald-50\s+dark:bg-emerald-950/40',
        'bg-brand-primary-bg-light',
        content
    )
    content = re.sub(
        r'bg-emerald-50\s+dark:bg-emerald-950/30',
        'bg-brand-primary-bg-light',
        content
    )
    # Standalone bg-emerald-50
    content = re.sub(r'bg-emerald-50\b', 'bg-brand-primary-bg-light', content)

    # 9. bg-emerald-900 dark:bg-emerald-950 → bg-brand-primary-darkest
    content = re.sub(
        r'bg-emerald-900\s+dark:bg-emerald-950\b',
        'bg-brand-primary-darkest',
        content
    )
    # Standalone bg-emerald-900
    content = re.sub(r'bg-emerald-900\b', 'bg-brand-primary-darkest', content)
    content = re.sub(r'bg-emerald-950\b', 'bg-brand-primary-darkest', content)

    # 10. bg-emerald-800 → bg-brand-primary-darkest (slightly different shade)
    content = re.sub(r'bg-emerald-800\b', 'bg-brand-primary-darkest', content)

    # 11. text-emerald-300 → text-brand-primary-light-text
    content = re.sub(r'text-emerald-300\b', 'text-brand-primary-light-text', content)

    # 12. border-emerald-300 dark:border-emerald-700 → border-brand-primary
    content = re.sub(
        r'border-emerald-300\s+dark:border-emerald-700',
        'border-brand-primary',
        content
    )
    content = re.sub(r'border-emerald-500\b', 'border-brand-primary', content)
    content = re.sub(r'border-emerald-300\b', 'border-brand-primary', content)

    # 13. fill-emerald-400 → KEEP AS IS (stars, not brand) — no replacement
    # Actually fill-emerald is not used for stars. Stars use fill-amber.
    # Any remaining emerald fill is brand-related.
    content = re.sub(r'fill-emerald-500\b', 'fill-brand-primary', content)

    # 14. bg-emerald-600 → bg-brand-primary-hover (used for dark text badge bg)
    content = re.sub(r'bg-emerald-600\b', 'bg-brand-primary-hover', content)

    # ============================================================
    # HEADING COLOR replacements
    # text-slate-800 dark:text-white → text-brand-heading
    # ============================================================

    content = re.sub(
        r'text-slate-800\s+dark:text-white\b',
        'text-brand-heading',
        content
    )
    # Standalone text-slate-800 (rare but possible)
    content = re.sub(r'\btext-slate-800\b', 'text-brand-heading', content)

    # text-slate-900 → text-brand-heading (slightly darker, same role)
    content = re.sub(r'\btext-slate-900\b', 'text-brand-heading', content)

    # text-slate-700 dark:text-slate-200 → text-brand-heading-secondary
    content = re.sub(
        r'text-slate-700\s+dark:text-slate-200\b',
        'text-brand-heading-secondary',
        content
    )
    content = re.sub(r'\btext-slate-700\b(?!.*dark:text)', 'text-brand-heading-secondary', content)

    # text-slate-600 dark:text-slate-300 → text-brand-body
    content = re.sub(
        r'text-slate-600\s+dark:text-slate-300\b',
        'text-brand-body',
        content
    )

    # ============================================================
    # Link/active nav color
    # text-emerald-600 (standalone for links without dark variant)
    # Already handled above as text-brand-primary-text
    # ============================================================

    # ============================================================
    # Button specific replacements
    # "bg-emerald-500 hover:bg-emerald-600 text-white" → use brand
    # Already handled by the bg patterns above
    # ============================================================

    # Button: bg-brand-primary hover:bg-brand-primary-hover text-white
    # This pattern is already covered

    return content


def main():
    count = 0
    files_changed = []

    for root, dirs, files in os.walk(BASE):
        # Filter out skip dirs
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            filepath = os.path.join(root, f)
            if not should_process(filepath):
                continue
            try:
                with open(filepath, 'r', encoding='utf-8') as fh:
                    original = fh.read()
                modified = replace_colors(original)
                if modified != original:
                    with open(filepath, 'w', encoding='utf-8') as fh:
                        fh.write(modified)
                    rel = os.path.relpath(filepath, BASE)
                    files_changed.append(rel)
                    count += 1
            except Exception as e:
                print(f"ERROR processing {filepath}: {e}")

    print(f"\n=== Replaced colors in {count} files ===")
    for f in sorted(files_changed):
        print(f"  ✓ {f}")


if __name__ == "__main__":
    main()