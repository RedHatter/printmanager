import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-re'
import json from 'rollup-plugin-json'
import fs from 'fs'

const styles = fs
  .createWriteStream('./public/styles.css')
  .on('error', console.error)

const config = [
  {
    input: './src/index.js',
    plugins: [
      replace({
        replaces: {
          'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'development'
          )
        },
        patterns: [
          {
            match: /\.jsx$/,
            test: /<style>([\s\S]+?)<\/style>/g,
            replace: (_, css) => {
              styles.write(css)
              return ''
            }
          }
        ]
      }),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react'],
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            { decoratorsBeforeExport: true }
          ],
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-object-rest-spread',
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-logical-assignment-operators'
        ]
      }),
      resolve(),
      commonjs({
        include: ['node_modules/**', './utils.js'],
        namedExports: {
          react: [
            'useState',
            'useEffect',
            'useContext',
            'useRef',
            'useReducer',
            'useCallback',
            'useDebugValue',
            'createContext',
            'createElement',
            'Component',
            'PureComponent',
            'Fragment',
            'cloneElement',
            'forwardRef'
          ],
          'react-dom': ['findDOMNode'],
          'react-is': ['isLazy', 'isMemo', 'ForwardRef'],
          'prop-types': [
            'elementType',
            'oneOfType',
            'object',
            'string',
            'number',
            'instanceOf',
            'oneOf',
            'func',
            'element',
            'arrayOf',
            'bool',
            'any',
            'shape',
            'node'
          ],
          '@dbeining/react-atom': ['Atom', 'swap', 'deref', 'useAtom'],
          'draft-js': ['Editor', 'EditorState', 'RichUtils', 'Modifier'],
          'draft-js-export-html': ['stateToHTML']
        }
      }),
      json()
    ],
    output: {
      file: './public/bundle.js',
      format: 'iife'
    }
  },
  {
    input: './src/auth/Login.jsx',
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react']
      }),
      resolve(),
      commonjs({
        include: 'node_modules/**',
        namedExports: {
          react: ['useState', 'useEffect', 'useContext', 'Fragment'],
          'react-is': ['isLazy', 'isMemo', 'ForwardRef'],
          'prop-types': ['elementType']
        }
      }),
      json(),
      replace({
        replaces: {
          'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'development'
          )
        }
      })
    ],
    output: {
      file: './public/login/bundle.js',
      format: 'iife'
    }
  }
]

export default new Promise((resolve, reject) =>
  fs
    .createReadStream('./node_modules/draft-js/dist/Draft.css')
    .on('close', () => resolve(config))
    .on('error', reject)
    .pipe(
      styles,
      { end: false }
    )
)
