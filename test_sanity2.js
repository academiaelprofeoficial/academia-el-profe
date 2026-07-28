const https = require('https');

https.get('https://xfe382kb.api.sanity.io/v2025-01-01/data/query/production?query=*[_type=="course"%20%26%26%20slug.current=="calculo-diferencial"][0]{title,%20topics[]{title,%20classVideos[]{title,%20isFree}}}', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
