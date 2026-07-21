import re

with open('temp_video_player_utf8.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove lg:hidden from mobile controls
content = content.replace('className={lg:hidden absolute inset-0', 'className={bsolute inset-0')

# Change the onClick for the mobile overlay wrapper
old_onclick = 'onClick={() => setShowControls(prev => !prev)}'
new_onclick = 'onClick={(e) => { togglePlay(e); setShowControls(true); resetControlsTimer(); }}'
content = content.replace(old_onclick, new_onclick)

# Remove the desktop controls block entirely
# The block starts at {/* ===== CONTROLES DESKTOP
desktop_start = content.find('{/* ===== CONTROLES DESKTOP')
if desktop_start != -1:
    # Find where the desktop block ends. It ends right before {/* Indicador de PiP */}
    # Wait, in temp_video_player_utf8.tsx, the desktop block ends where?
    # Let's find {/* Indicador de PiP */}
    pip_start = content.find('{/* Indicador de PiP */}', desktop_start)
    if pip_start != -1:
        # We delete everything from desktop_start up to pip_start
        content = content[:desktop_start] + content[pip_start:]

# Also fix the desktop handleVideoClick which might be defined earlier
# Actually we can just leave handleVideoClick as is, since it's attached to the <video> element.
# The mobile overlay covers the video anyway, so its onClick intercepts.

with open('src/components/course/VideoPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
