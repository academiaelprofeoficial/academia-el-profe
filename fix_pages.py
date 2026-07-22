import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add hook import if needed (both files have useState, useEffect)
    # 2. Add useMediaQuery logic right after the component declaration
    # Find export function LeccionClient or export default function TemarioPageClient
    
    if "const [isDesktop, setIsDesktop] = useState" in content:
        print(f"Already patched {filepath}")
        return

    # Let's insert the isDesktop hook inside the component
    if "export function LeccionClient" in filepath:
        insert_marker = "const { user, isGoogleUser } = useUser();"
    else:
        insert_marker = "const [searchQuery, setSearchQuery] = useState('');"
    
    hook_code = """
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
"""
    content = content.replace(insert_marker, insert_marker + hook_code)

    # 3. Patch the VideoPlayer tags to conditionally render based on isDesktop
    if "LeccionClient" in filepath:
        # Desktop
        desktop_target = """              /* ---- VIDEO PLAYER ---- */
              <div className="rounded-2xl overflow-hidden bg-black">
                <VideoPlayer
                  videoUrl={videoUrl}
                  webmUrl={webmUrl}
                  titulo={currentVideo.title}
                />
              </div>"""
        
        desktop_replacement = """              /* ---- VIDEO PLAYER ---- */
              <div className="rounded-2xl overflow-hidden bg-black">
                {isDesktop && (
                  <VideoPlayer
                    videoUrl={videoUrl}
                    webmUrl={webmUrl}
                    titulo={currentVideo.title}
                  />
                )}
              </div>"""
        
        content = content.replace(desktop_target, desktop_replacement)

        # Mobile
        mobile_target = """          <div className="rounded-xl overflow-hidden bg-black mb-4">
            <VideoPlayer videoUrl={videoUrl} webmUrl={webmUrl} titulo={currentVideo.title} />
          </div>"""
        
        mobile_replacement = """          <div className="rounded-xl overflow-hidden bg-black mb-4">
            {!isDesktop && (
              <VideoPlayer videoUrl={videoUrl} webmUrl={webmUrl} titulo={currentVideo.title} />
            )}
          </div>"""

        content = content.replace(mobile_target, mobile_replacement)
    
    else: # TemarioPageClient
        # Desktop
        desktop_target = """                                  <VideoPlayer
                                    key={mobile-}
                                    videoUrl={selectedVideo.url}
                                    titulo={selectedVideo.title}
                                    posterUrl={selectedVideo.poster}
                                    isFree={selectedVideo.isFree}
                                  />"""
        
        desktop_replacement = """                                  {isDesktop && (
                                    <VideoPlayer
                                      key={desktop-}
                                      videoUrl={selectedVideo.url}
                                      titulo={selectedVideo.title}
                                      posterUrl={selectedVideo.poster}
                                      isFree={selectedVideo.isFree}
                                    />
                                  )}"""
        
        content = content.replace(desktop_target, desktop_replacement)

        # Mobile
        mobile_target = """                        <VideoPlayer
                          key={mobile-bottom-}
                          videoUrl={selectedVideo.url}
                          titulo={selectedVideo.title}
                          posterUrl={selectedVideo.poster}
                          isFree={selectedVideo.isFree}
                        />"""
        
        mobile_replacement = """                        {!isDesktop && (
                          <VideoPlayer
                            key={mobile-bottom-}
                            videoUrl={selectedVideo.url}
                            titulo={selectedVideo.title}
                            posterUrl={selectedVideo.poster}
                            isFree={selectedVideo.isFree}
                          />
                        )}"""

        content = content.replace(mobile_target, mobile_replacement)


    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/app/cursos/[slug]/lecciones/[videoOrder]/LeccionClient.tsx')
fix_file('src/app/cursos/[slug]/temario/TemarioPageClient.tsx')
print("Pages patched!")
