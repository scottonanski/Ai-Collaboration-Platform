import * as esbuild from 'esbuild-wasm';

let initialized = false;
let initializing: Promise<void> | null = null;

export const initializeEsbuild = async () => {
  if (initialized) return;
  if (initializing) return initializing;
  initializing = esbuild.initialize({
    wasmURL: '/esbuild.wasm',
    worker: true,
  }).then(() => {
    initialized = true;
    initializing = null;
    console.log('esbuild-wasm initialized successfully with version 0.25.2');
  }).catch((err) => {
    console.error('Failed to initialize esbuild:', err);
    initialized = false;
    initializing = null;
    throw err;
  });
  return initializing;
};