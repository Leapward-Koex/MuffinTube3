module.exports = function override (config, env) {
    console.log('override')
    config.resolve.fallback = {
        "path": false,
        "fs": false,
        "browser": false,
    }
    
    return config
}