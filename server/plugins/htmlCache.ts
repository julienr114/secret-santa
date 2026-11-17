// A page always asks the server again before being shown from the cache
// (Correction 11): after a deployment, a phone keeping an old page would
// load code files that no longer exist, and its taps would do nothing.
// The code files themselves keep their year of cache, their names change
// with each deployment. A page that already says how to be cached
// (`no-store` of the personal pages) keeps it.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (_response, { event }) => {
    if (!getResponseHeader(event, 'cache-control')) {
      setResponseHeader(event, 'cache-control', 'no-cache');
    }
  });
});
