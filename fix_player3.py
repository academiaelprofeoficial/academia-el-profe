import re

with open('src/components/course/VideoPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add toggle play/pause to the main overlay
old_overlay_click = "onClick={(e) => { setShowControls(true); resetControlsTimer(); }}"
new_overlay_click = """onClick={(e) => { 
            const video = videoRef.current;
            if (video) {
              if (video.paused) { video.play().catch(()=>{}); setIsPlaying(true); }
              else { video.pause(); setIsPlaying(false); }
            }
            setShowControls(true); 
            resetControlsTimer(); 
          }}"""
content = content.replace(old_overlay_click, new_overlay_click)

# 2. Extract Speed Control from Top Right
# Find the Playback Rate button
speed_button_block = """            {/* Playback Rate button */}
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

"""

# Remove it from top right
content = content.replace(speed_button_block, "")

# We need to change absolute top-full to bottom-full for the dropdown if it's on the bottom bar
speed_button_block_bottom = speed_button_block.replace('top-full right-0 mt-2', 'bottom-full right-0 mb-2')

# Insert it in the bottom bar
# The bottom bar time row looks like this:
#             {/* Time row */}
#             <div className="flex justify-between text-[11px] text-gray-300 font-mono">
#               <span>{formatTime(currentTime)}</span>
#               <span>{formatRemainingTime(currentTime, duration)}</span>
#             </div>

old_time_row = """            {/* Time row */}
            <div className="flex justify-between text-[11px] text-gray-300 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatRemainingTime(currentTime, duration)}</span>
            </div>"""

new_time_row = """            {/* Time row */}
            <div className="flex justify-between items-center text-[11px] text-gray-300 font-mono">
              <div className="flex items-center gap-3">
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{formatRemainingTime(currentTime, duration)}</span>
""" + speed_button_block_bottom.replace('            {/* Playback Rate button */}', '') + """              </div>
            </div>"""

content = content.replace(old_time_row, new_time_row)

with open('src/components/course/VideoPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("VideoPlayer updated!")
