// The resolve hook of ts-resolve.mjs.
const ROOT = new URL('../', import.meta.url);
const ALIASES = { '#server/': 'server/', '#shared/': 'shared/' };

const aliased = (specifier) => {
  const alias = Object.keys(ALIASES).find((key) => specifier.startsWith(key));
  return alias
    ? new URL(ALIASES[alias] + specifier.slice(alias.length), ROOT).href
    : specifier;
};

export const resolve = async (specifier, context, next) => {
  const target = aliased(specifier);
  const local = target.startsWith('.') || target.startsWith('file:');
  if (!local || /\.[cm]?[jt]s$/.test(target)) return next(target, context);
  // A file without its extension, then a folder by its index.
  try {
    return await next(`${target}.ts`, context);
  } catch {
    try {
      return await next(`${target}/index.ts`, context);
    } catch {
      return next(target, context);
    }
  }
};
