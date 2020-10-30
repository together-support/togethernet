import browserify from 'browserify-middleware';
import babelify from 'babelify';
import publicConfig from './src/public/js/publicConfig.js';

browserify.settings({
  transform: [
      babelify.configure({
      extensions: ['.js'],
      presets: [
        "@babel/preset-env", 
        "@babel/preset-react"
      ],
      plugins: [
        "@babel/plugin-proposal-class-properties"
      ]
    }),
    ['envify', publicConfig]
  ]
});

export default browserify;