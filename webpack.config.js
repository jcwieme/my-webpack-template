/* eslint-disable new-cap */
// Constante du path
const path = require('path')
// Minification du js
const minificationPlugin = require('uglifyjs-webpack-plugin')
// Reload du css
const miniCss = require('mini-css-extract-plugin')
// Utilisation du cache
const manifestPlugin = require('webpack-plugin-manifest')
// Clean le dossier dist
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// Minification CSS
const minimizeCss = require('optimize-css-assets-webpack-plugin')
// Mis à jour de l'html
const HtmlWebpackPlugin = require('html-webpack-plugin')

const fs = require('fs')

// Savoir si on est en dev ou pas
const dev = process.env.NODE_ENV === 'dev'

// Variable global par défaut des CSS Loaders qui sort un app.css avec miniCss
const cssLoaders = [
  {
    loader: miniCss.loader,
    options: {
      publicPath: '../',
      hmr: process.env.NODE_ENV === 'dev',
      reloadAll: true
    }
  },
  { loader: 'css-loader', options: { importLoaders: 1 } },
  {
    // Utilisation de l'autoprefixer pour le css
    loader: 'postcss-loader',
    options: {
      plugins: (loader) => [
        require('autoprefixer')()
      ]
    }
  },
  'sass-loader'
]

// Function to walk through files and directories at a given path
function walkDir (rootDir) {
  const paths = []
  // A recursive function
  // - If a path is a file it will add to an array to be returned
  // - If a path is a directory it will call itself on the directory
  function walk (directory, parent) {
    const dirPath = path.resolve(__dirname, directory)
    const templateFiles = fs.readdirSync(dirPath)

    // Check each path found, add files to array and call self on directories found
    templateFiles.forEach(file => {
      const filepath = path.resolve(__dirname, directory, file)
      const isDirectory = fs.lstatSync(filepath).isDirectory()

      if (isDirectory) {
        // File is a directory
        const subDirectory = path.join(directory, file)
        if (parent) {
          // Join parent/file before passing so we have correct path
          const parentPath = path.join(parent, file)
          walk(subDirectory, parentPath)
        } else {
          walk(subDirectory, file)
        }
      } else {
        if (parent) {
          // Parent exists, join it with file to create the path
          const fileWithParent = path.join(parent, file)
          paths.push(fileWithParent)
        } else {
          paths.push(file)
        }
      }
    })
  }

  // Start our function, it will call itself until there no paths left
  walk(rootDir)

  return paths
}

// Our function that generates our html plugins
function generateHtmlPlugins (templateDir) {
  // Read files in template directory
  const templateFiles = walkDir(templateDir)
  const checkedFiles = []
  templateFiles.forEach(item => {
    // Split names and extension
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]
    if (extension === 'html') {
      checkedFiles.push(new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
      }))
    }
  })
  return checkedFiles
}

// Call our function on our views directory.
const htmlPlugins = generateHtmlPlugins('./src')

const config = {
  // Nom d'entrée
  entry: {
    app: './src/js/app.js'
  },
  // Path de sortie avec nom de sortie
  output: {
    path: path.resolve('./dist'),
    filename: dev ? 'js/[name].js' : 'js/[name].[hash:4].js',
    publicPath: dev ? '/dist/' : ''
  },
  // Environnement de dev
  mode: 'development',
  // Récupération du devtool permettant de faire des source map en dev
  devtool: dev ? 'cheap-module-eval-source-map' : false,
  // Dev Server options
  devServer: {
    overlay: true,
    compress: true,
    hot: false,
    watchContentBase: true,
    index: 'src/index.html',
    injectHot: true,
    liveReload: true,
    writeToDisk: true,
    contentBase: path.resolve('./src')
  },
  watchOptions: {
    ignored: /node_modules/
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'app',
          test: /\.scss$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      // Utilisation de babel afin de rendre compatible le js avec les version ultérieur
      {
        enforce: 'pre',
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['eslint-loader']
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: cssLoaders
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        type: 'javascript/auto',
        test: /\.json$/,
        exclude: /(node_modules|bower_components)/,
        include: path.resolve('./src/json'),
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/json'
          }
        }]
      },
      // File loader for images
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash:4].[ext]',
              outputPath: 'assets/images',
              esModule: false
            }
          },
          'img-loader'
        ]
      },
      // File loader for svg
      {
        test: /\.(svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash:4].[ext]',
              outputPath: 'assets/images/svg',
              esModule: false
            }
          },
          'img-loader'
        ]
      },
      // File loader for fonts
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:4].[ext]',
              outputPath: 'assets/fonts'
            }
          }
        ]
      },
      // File loader for sounds
      {
        test: /\.(wav)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:4].[ext]',
              outputPath: 'assets/sounds'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new miniCss({
      filename: dev ? 'css/[name].css' : 'css/[name].[hash:4].css',
      chunkFilename: dev ? 'css/[id].css' : 'css/[id].[hash:4].css',
      ignoreOrder: false
    })
  ].concat(htmlPlugins)
}

if (!dev) {
//   config.plugins.push(new CleanWebpackPlugin())
  // Minification du JS seulement en production (pas en dev)
  config.plugins.push(new minificationPlugin({
    // Forcer Uglify a exporté les sources map en mettant true
    sourceMap: true
  }))
  config.plugins.push(new minimizeCss())
  config.plugins.push(new manifestPlugin())
}

module.exports = config
