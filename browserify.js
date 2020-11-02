import browserify from 'browserify-middleware';
import babelify from 'babelify';
import publicConfig from './src/public/config/index.js';

browserify.settings({
  transform: [
      babelify.configure({
      extensions: ['.js'],
      presets: [
        "@babel/preset-env", 
        "@babel/preset-react"
      ],
      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-runtime"
      ]
    }),
    ['envify', publicConfig]
  ]
});

export default browserify;