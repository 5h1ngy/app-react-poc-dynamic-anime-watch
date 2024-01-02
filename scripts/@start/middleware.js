'use strict';

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const { createCompiler, prepareProxy, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const semver = require('semver');

const webpackFactory = require('../../webpack');
const createDevServerConfig = require('../../webpack/_webpackDevServer.config');
const paths = require('../../shared/paths');
const getClientEnvironment = require('../../shared/environment');

const { HOST, IS_INTERACTIVE } = require('./utils');

const APP = require(require.resolve('react', { paths: [paths.appPath] }));
const ENVIRONMENT = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const USE_YARN = fs.existsSync(paths.yarnLockFile);

function callbackRun(port) {
    // We have not found a port.
    if (port == null) return;

    const config = webpackFactory('development').compile();

    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = prepareUrls(protocol, HOST, port, paths.publicUrlOrPath.slice(0, -1));

    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({ appName, config, urls, useYarn: USE_YARN, useTypeScript, webpack });

    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic, paths.publicUrlOrPath);

    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = { ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig), host: HOST, port };
    const devServer = new WebpackDevServer(serverConfig, compiler);

    // Launch WebpackDevServer.
    devServer.startCallback(() => {
        if (IS_INTERACTIVE) clearConsole();
        if (ENVIRONMENT.raw.FAST_REFRESH && semver.lt(APP.version, '16.10.0')) console.log(chalk.yellow(`Fast Refresh requires React 16.10 or higher. You are using React ${APP.version}.`));

        console.log(chalk.cyan('Starting the development server...\n'));
        openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => {
        devServer.close();
        process.exit();
    }));

    if (process.env.CI !== 'true') {
        // Gracefully exit when stdin ends
        process.stdin.on('end', () => {
            devServer.close();
            process.exit();
        });
    }
}

function handleError(err) {
    if (err && err.message) console.log(err.message);
    process.exit(1);
}

module.exports = {
    callbackRun,
    handleError
}