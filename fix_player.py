import re

with open('src/components/course/VideoPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. Fix tap to pause ---
content = content.replace('onClick={handleVideoClick}', '')
content = content.replace('onTouchEnd={handleVideoTouch}', '')

# --- 2. Fix drag progress bar ---
# Replace seekToPosition
old_seek = """    const seekToPosition = useCallback((clientX: number, element: HTMLElement) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      v.currentTime = x * duration;
    }, [duration]);"""

new_seek = """    const getSeekTime = useCallback((clientX: number, element: HTMLElement) => {
      if (!duration) return 0;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return x * duration;
    }, [duration]);"""

content = content.replace(old_seek, new_seek)

# Replace handleSeek
old_handleSeek = """    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      seekToPosition(e.clientX, e.currentTarget);
    }, [seekToPosition]);"""

new_handleSeek = """    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const newTime = getSeekTime(e.clientX, e.currentTarget);
      setCurrentTime(newTime);
      const v = videoRef.current;
      if (v) v.currentTime = newTime;
    }, [getSeekTime]);"""

content = content.replace(old_handleSeek, new_handleSeek)

# Replace handleSeekTouchStart
old_handleSeekTouchStart = """    const handleSeekTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      isSeekingTouch.current = true;
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      const touch = e.touches[0];
      seekToPosition(touch.clientX, e.currentTarget);
    }, [seekToPosition]);"""

new_handleSeekTouchStart = """    const handleSeekTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      isSeekingTouch.current = true;
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      const touch = e.touches[0];
      const newTime = getSeekTime(touch.clientX, e.currentTarget);
      setCurrentTime(newTime);
    }, [getSeekTime]);"""

content = content.replace(old_handleSeekTouchStart, new_handleSeekTouchStart)

# Replace handleSeekTouchMove
old_handleSeekTouchMove = """    const handleSeekTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      if (!isSeekingTouch.current) return;
      e.stopPropagation();
      const touch = e.touches[0];
      if (seekBarRef.current) {
        seekToPosition(touch.clientX, seekBarRef.current);
      }
    }, [seekToPosition]);"""

new_handleSeekTouchMove = """    const handleSeekTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      if (!isSeekingTouch.current) return;
      e.stopPropagation();
      const touch = e.touches[0];
      if (seekBarRef.current) {
        const newTime = getSeekTime(touch.clientX, seekBarRef.current);
        setCurrentTime(newTime);
      }
    }, [getSeekTime]);"""

content = content.replace(old_handleSeekTouchMove, new_handleSeekTouchMove)

# Replace handleSeekTouchEnd
old_handleSeekTouchEnd = """    const handleSeekTouchEnd = useCallback(() => {
      isSeekingTouch.current = false;
    }, []);"""

new_handleSeekTouchEnd = """    const handleSeekTouchEnd = useCallback(() => {
      isSeekingTouch.current = false;
      const v = videoRef.current;
      if (v) v.currentTime = currentTime;
    }, [currentTime]);"""

content = content.replace(old_handleSeekTouchEnd, new_handleSeekTouchEnd)

# Replace onTimeUpdate
old_timeUpdate = """          onTimeUpdate={() => {
            const v = videoRef.current;
            if (!v) return;
            setCurrentTime(v.currentTime);
            onProgress?.(v.currentTime, v.duration);
          }}"""

new_timeUpdate = """          onTimeUpdate={() => {
            const v = videoRef.current;
            if (!v) return;
            if (!isSeekingTouch.current) {
              setCurrentTime(v.currentTime);
            }
            onProgress?.(v.currentTime, v.duration);
          }}"""

content = content.replace(old_timeUpdate, new_timeUpdate)

with open('src/components/course/VideoPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("VideoPlayer touch seeking and clicking fixed!")
