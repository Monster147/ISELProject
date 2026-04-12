const path = require("path");

module.exports = {
    resolver: {
        extraNodeModules: {
            "@common": path.resolve(__dirname, "../commons"),
        },
    },
    watchFolders: [
        path.resolve(__dirname, "../commons"),
    ],
};