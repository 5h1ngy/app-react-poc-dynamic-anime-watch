'use strict';

const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');

const paths = require('../shared/paths');
const Shared = require('./Shared');

class Module {
    static _imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000');

    // Check if Tailwind config exists
    static _useTailwind = fs.existsSync(path.join(paths.appPath, 'tailwind.config.js'));

    // style files regexes
    static _cssRegex = /\.css$/;
    static _cssModuleRegex = /\.module\.css$/;
    static _sassRegex = /\.(scss|sass)$/;
    static _sassModuleRegex = /\.module\.(scss|sass)$/;

    // common function to get style loaders
    _getStyleLoaders = (cssOptions, preProcessor) => {
        const loaders = [
            Shared.isEnvDevelopment && require.resolve('style-loader'),
            Shared.isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                // css is located in `static/css`, use '../../' to locate index.html folder
                // in production `paths.publicUrlOrPath` can be a relative path
                options: paths.publicUrlOrPath.startsWith('.')
                    ? { publicPath: '../../' }
                    : {},
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions,
            },
            {
                // Options for PostCSS as we reference these options twice
                // Adds vendor prefixing based on your specified browser support in
                // package.json
                loader: require.resolve('postcss-loader'),
                options: {
                    postcssOptions: {
                        // Necessary for external CSS imports to work
                        // https://github.com/facebook/create-react-app/issues/2677
                        ident: 'postcss',
                        config: false,
                        plugins: !Module._useTailwind
                            ? [
                                'postcss-flexbugs-fixes',
                                [
                                    'postcss-preset-env',
                                    {
                                        autoprefixer: {
                                            flexbox: 'no-2009',
                                        },
                                        stage: 3,
                                    },
                                ],
                                // Adds PostCSS Normalize as the reset css with default options,
                                // so that it honors browserslist config in package.json
                                // which in turn let's users customize the target behavior as per their needs.
                                'postcss-normalize',
                            ]
                            : [
                                'tailwindcss',
                                'postcss-flexbugs-fixes',
                                [
                                    'postcss-preset-env',
                                    {
                                        autoprefixer: {
                                            flexbox: 'no-2009',
                                        },
                                        stage: 3,
                                    },
                                ],
                            ],
                    },
                    sourceMap: Shared.isEnvProduction ? Shared.shouldUseSourceMap : Shared.isEnvDevelopment,
                },
            },
        ].filter(Boolean);

        if (preProcessor) {
            loaders.push(
                {
                    loader: require.resolve('resolve-url-loader'),
                    options: {
                        sourceMap: Shared.isEnvProduction ? Shared.shouldUseSourceMap : Shared.isEnvDevelopment,
                        root: paths.appSrc,
                    },
                },
                {
                    loader: require.resolve(preProcessor),
                    options: {
                        sourceMap: true,
                    },
                }
            );
        }
        return loaders;
    };

    get config() {
        return {
            strictExportPresence: true,
            rules: [
                // Handle node_modules packages that contain sourcemaps
                Shared.shouldUseSourceMap && {
                    enforce: 'pre',
                    exclude: /@babel(?:\/|\\{1,2})runtime/,
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: require.resolve('source-map-loader'),
                },
                {
                    // "oneOf" will traverse all following loaders until one will
                    // match the requirements. When no loader matches it will fall
                    // back to the "file" loader at the end of the loader list.
                    oneOf: [
                        // TODO: Merge this config once `image/avif` is in the mime-db
                        // https://github.com/jshttp/mime-db
                        {
                            test: [/\.avif$/],
                            type: 'asset',
                            mimetype: 'image/avif',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: Module._imageInlineSizeLimit,
                                },
                            },
                        },
                        // "url" loader works like "file" loader except that it embeds assets
                        // smaller than specified limit in bytes as data URLs to avoid requests.
                        // A missing `test` is equivalent to a match.
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: Module._imageInlineSizeLimit,
                                },
                            },
                        },
                        {
                            test: /\.svg$/,
                            use: [
                                {
                                    loader: require.resolve('@svgr/webpack'),
                                    options: {
                                        prettier: false,
                                        svgo: false,
                                        svgoConfig: {
                                            plugins: [{ removeViewBox: false }],
                                        },
                                        titleProp: true,
                                        ref: true,
                                    },
                                },
                                {
                                    loader: require.resolve('file-loader'),
                                    options: {
                                        name: 'static/media/[name].[hash].[ext]',
                                    },
                                },
                            ],
                            issuer: {
                                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
                            },
                        },
                        // Process application JS with Babel.
                        // The preset includes JSX, Flow, TypeScript, and some ESnext features.
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                customize: require.resolve(
                                    'babel-preset-react-app/webpack-overrides'
                                ),
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app'),
                                        {
                                            runtime: Shared.hasJsxRuntime ? 'automatic' : 'classic',
                                        },
                                    ],
                                ],

                                plugins: [
                                    Shared.isEnvDevelopment &&
                                    Shared.shouldUseReactRefresh &&
                                    require.resolve('react-refresh/babel'),
                                ].filter(Boolean),
                                // This is a feature of `babel-loader` for webpack (not Babel itself).
                                // It enables caching results in ./node_modules/.cache/babel-loader/
                                // directory for faster rebuilds.
                                cacheDirectory: true,
                                // See #6846 for context on why cacheCompression is disabled
                                cacheCompression: false,
                                compact: Shared.isEnvProduction,
                            },
                        },
                        // Process any JS outside of the app with Babel.
                        // Unlike the application JS, we only compile the standard ES features.
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app/dependencies'),
                                        { helpers: true },
                                    ],
                                ],
                                cacheDirectory: true,
                                // See #6846 for context on why cacheCompression is disabled
                                cacheCompression: false,

                                // Babel sourcemaps are needed for debugging into node_modules
                                // code.  Without the options below, debuggers like VSCode
                                // show incorrect code and set breakpoints on the wrong lines.
                                sourceMaps: Shared.shouldUseSourceMap,
                                inputSourceMap: Shared.shouldUseSourceMap,
                            },
                        },
                        // "postcss" loader applies autoprefixer to our CSS.
                        // "css" loader resolves paths in CSS and adds assets as dependencies.
                        // "style" loader turns CSS into JS modules that inject <style> tags.
                        // In production, we use MiniCSSExtractPlugin to extract that CSS
                        // to a file, but in development "style" loader enables hot editing
                        // of CSS.
                        // By default we support CSS Modules with the extension .module.css
                        {
                            test: Module._cssRegex,
                            exclude: Module._cssModuleRegex,
                            use: this._getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: Shared.isEnvProduction
                                    ? Shared.shouldUseSourceMap
                                    : Shared.isEnvDevelopment,
                                modules: {
                                    mode: 'icss',
                                },
                            }),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                        },
                        // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
                        // using the extension .module.css
                        {
                            test: Module._cssModuleRegex,
                            use: this._getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: Shared.isEnvProduction
                                    ? Shared.shouldUseSourceMap
                                    : Shared.isEnvDevelopment,
                                modules: {
                                    mode: 'local',
                                    getLocalIdent: getCSSModuleLocalIdent,
                                },
                            }),
                        },
                        // Opt-in support for SASS (using .scss or .sass extensions).
                        // By default we support SASS Modules with the
                        // extensions .module.scss or .module.sass
                        {
                            test: Module._sassRegex,
                            exclude: Module._sassModuleRegex,
                            use: this._getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: Shared.isEnvProduction
                                        ? Shared.shouldUseSourceMap
                                        : Shared.isEnvDevelopment,
                                    modules: {
                                        mode: 'icss',
                                    },
                                },
                                'sass-loader'
                            ),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                        },
                        // Adds support for CSS Modules, but using SASS
                        // using the extension .module.scss or .module.sass
                        {
                            test: Module._sassModuleRegex,
                            use: this._getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: Shared.isEnvProduction
                                        ? Shared.shouldUseSourceMap
                                        : Shared.isEnvDevelopment,
                                    modules: {
                                        mode: 'local',
                                        getLocalIdent: getCSSModuleLocalIdent,
                                    },
                                },
                                'sass-loader'
                            ),
                        },
                        // "file" loader makes sure those assets get served by WebpackDevServer.
                        // When you `import` an asset, you get its (virtual) filename.
                        // In production, they would get copied to the `build` folder.
                        // This loader doesn't use a "test" so it will catch all modules
                        // that fall through the other loaders.
                        {
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            type: 'asset/resource',
                        },
                        // ** STOP ** Are you adding a new loader?
                        // Make sure to add the new loader(s) before the "file" loader.
                    ],
                },
            ].filter(Boolean),
        }
    }
}

module.exports = Module;