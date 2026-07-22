import re

with open('src/components/course/VideoPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the current speed selector block:
old_block = """            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className="px-2 py-1 transition-all active:scale-90 text-white font-mono text-xs font-bold drop-shadow-lg bg-black/40 rounded hover:bg-black/60"
                aria-label="Velocidad de reproducción"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div
                  className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-xl p-2 shadow-xl border border-white/10 flex flex-col gap-1 z-50"
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
            </div>"""

new_block = """            <div className="relative flex items-center justify-center bg-black/40 hover:bg-black/60 rounded">
              <select
                value={playbackRate}
                onChange={(e) => { e.stopPropagation(); handleSpeedChange(parseFloat(e.target.value)); }}
                onClick={(e) => e.stopPropagation()}
                className="appearance-none pl-3 pr-5 py-1 bg-transparent text-white font-mono text-xs font-bold cursor-pointer outline-none w-full h-full"
                style={{ WebkitAppearance: 'none' }}
                aria-label="Velocidad de reproducción"
              >
                <option value="0.75" className="text-black bg-white">0.75x</option>
                <option value="1" className="text-black bg-white">1x</option>
                <option value="1.25" className="text-black bg-white">1.25x</option>
                <option value="1.5" className="text-black bg-white">1.5x</option>
                <option value="2" className="text-black bg-white">2x</option>
              </select>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("Could not find the speed block to replace")

with open('src/components/course/VideoPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Speed selector updated!")
