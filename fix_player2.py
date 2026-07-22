import re

with open('src/components/course/VideoPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a playback rate function
new_playback = """    const handleSpeedChange = useCallback((speed: number) => {
      setPlaybackRate(speed);
      const v = videoRef.current;
      if (v) v.playbackRate = speed;
      setShowSpeedMenu(false);
    }, []);"""

# Insert after handleVolumeChange
content = content.replace("    const toggleFullscreen =", new_playback + "\n\n    const toggleFullscreen =")

# Add the UI for playback rate next to PiP button
# Find where PiP button is rendered
pip_button_code = """            {/* PiP button — sin círculo */}
            {pipEnabled && (
              <button
                onClick={(e) => { e.stopPropagation(); togglePictureInPicture(e); }}
                className={p-1.5 transition-all active:scale-90 }
                aria-label="Picture in Picture"
              >
                <PictureInPicture2 className="w-5 h-5 drop-shadow-lg" />
              </button>
            )}"""

speed_button_code = """            {/* Playback Rate button */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className="px-2 py-1 transition-all active:scale-90 text-white font-mono text-xs font-bold drop-shadow-lg bg-black/40 rounded hover:bg-black/60"
                aria-label="Velocidad de reproducción"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div
                  className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-white/10 flex flex-col gap-1 z-50"
                  onMouseLeave={() => setShowSpeedMenu(false)}
                >
                  {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={(e) => { e.stopPropagation(); handleSpeedChange(speed); }}
                      className={	ext-xs px-4 py-1.5 rounded-lg text-left transition-colors }
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

""" + pip_button_code

content = content.replace(pip_button_code, speed_button_code)

with open('src/components/course/VideoPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Playback rate added!")
