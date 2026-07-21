import subprocess

result = subprocess.run(['git', 'show', 'FETCH_HEAD:src/components/course/VideoPlayer.tsx'], capture_output=True)
content = result.stdout.decode('utf-8')

# Remove lg:hidden from mobile controls
content = content.replace('className={lg:hidden absolute inset-0', 'className={bsolute inset-0')

# Change the onClick for the mobile overlay wrapper
old_onclick = 'onClick={() => setShowControls(prev => !prev)}'
new_onclick = 'onClick={(e) => { togglePlay(e); setShowControls(true); resetControlsTimer(); }}'
content = content.replace(old_onclick, new_onclick)

# Remove the desktop controls block entirely
desktop_start = content.find('{/* ===== CONTROLES DESKTOP')
if desktop_start != -1:
    pip_start = content.find('{/* Indicador de PiP */}', desktop_start)
    if pip_start != -1:
        content = content[:desktop_start] + content[pip_start:]

with open('src/components/course/VideoPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Clean rewrite done')
