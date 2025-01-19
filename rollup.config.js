import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';
import path from 'path';
import fs from 'fs';

const BASE_DIR = 'webserver/websites/KoesterVentures';

// Clean public directory
function cleanPublicDir() {
  const publicDir = `${BASE_DIR}/public`;
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
}

// Ensure directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Clean and create directories
cleanPublicDir();
ensureDirectoryExists(`${BASE_DIR}/public/css`);
ensureDirectoryExists(`${BASE_DIR}/public/js`);
ensureDirectoryExists(`${BASE_DIR}/public/images`);

export default {
  input: `${BASE_DIR}/src/js/app.js`,
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: `${BASE_DIR}/public/js/bundle.js`
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: true
      },
      emitCss: true
    }),
    css({ 
      output: function(styles, styleNodes) {
        fs.writeFileSync(`${BASE_DIR}/public/css/bundle.css`, styles);
      }
    }),
    copy({
      targets: [
        {
          src: `${BASE_DIR}/src/*.html`,
          dest: `${BASE_DIR}/public`
        },
        {
          src: `${BASE_DIR}/src/images/*`,
          dest: `${BASE_DIR}/public/images`
        },
        { 
           src: `${BASE_DIR}/src/js/*`,
          dest: `${BASE_DIR}/public/js`
        },
        { 
          src: `${BASE_DIR}/src/css/*`,
         dest: `${BASE_DIR}/public/css`
       }
      ],
      verbose: true
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs()
  ],
  watch: {
    clearScreen: false
  }
};
