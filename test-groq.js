const sanityClient = require('next-sanity');

const client = sanityClient.createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'y671g12z', // Use the one from .env if we can, or hardcode it since it's public. Wait, it's public.
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
});

async function run() {
  const query = `*[_type == "course" && (group != "utp" || !defined(group))] | order(order asc) { _id, title, "slug": slug.current, group }`;
  try {
    const data = await client.fetch(query);
    console.log("SUCCESS:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
run();
