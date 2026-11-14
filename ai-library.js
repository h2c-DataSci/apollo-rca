// Load the pinned Transformers.js build. Dynamic import() inside a worker
// cannot take an integrity attribute, so the bytes are checked first.
// The import URL is unchanged: the library derives its public path from it.
const PINNED = '@huggingface/transformers@3.7.6';

export async function importVerifiedLibrary(url, integrity, deps = globalThis) {
  if (typeof url !== 'string' || !url.includes(PINNED)) throw new Error('The browser AI library URL is not the pinned release.');
  if (typeof integrity !== 'string' || !/^sha384-[A-Za-z0-9+/]+={0,2}$/.test(integrity)) throw new Error('The browser AI library is not pinned.');
  if (typeof deps.fetch !== 'function') throw new Error('The browser AI library could not be verified.');
  const response = await deps.fetch(url, {
    integrity,
    mode: 'cors',
    credentials: 'omit',
    cache: 'force-cache',
    redirect: 'error'
  });
  if (!response || !response.ok) throw new Error('The browser AI library could not be verified.');
  if (typeof response.arrayBuffer === 'function') await response.arrayBuffer();
  const load = deps.importModule || ((specifier) => import(specifier));
  return load(url);
}
