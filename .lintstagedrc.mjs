// ESLint 9 resolves eslint.config.mjs from the cwd by default; the flag makes it use the
// nearest config to each file, so every workspace package keeps its own rules.
export default {
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --flag v10_config_lookup_from_file --fix', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
};
