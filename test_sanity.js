import { createClient } from 'next-sanity';

const client = createClient({
  projectId: 'yi6l4uvf',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01'
});

client.fetch(`*[_type=="course" && slug.current=="calculo-diferencial"][0]{
  "topics": topics[0..0]{
    "classVideos": classVideos[]{
      title,
      isFree,
      hasVideo,
      videoUrl,
      "videoFile": video.asset->url,
      "sharedVideoUrl": sharedVideo.videoUrl,
      "sharedVideoFile": sharedVideo.videoFile.asset->url
    }
  }
}`).then(data => console.dir(data, {depth: null})).catch(console.error);
