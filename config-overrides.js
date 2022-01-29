module.exports = function override (config, env) {
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        'process': require.resolve('process/browser'),
        "fs": false,
        "tls": false,
        "net": false,
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": false,
        "path": false,
        "stream": require.resolve("stream-browserify"),
        "util": false,
        "crypto": false,
        "timers": require.resolve("timers-browserify"),
        "querystring": require.resolve("querystring-es3"),
        "buffer": require.resolve("buffer/"),
        "vm": require.resolve("vm-browserify"),
        "url": require.resolve("url/"),
        "assert": require.resolve("assert/"),
        "os": require.resolve("os-browserify/browser"),
        "constants": require.resolve("constants-browserify"),
        'dns': require.resolve('@i2labs/dns'),
    }
    
    return config
}