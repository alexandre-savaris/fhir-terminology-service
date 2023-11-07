// https://solaaremupelumi.medium.com/using-es6-import-and-export-statements-for-jest-testing-in-node-js-b20c8bd9041c
// https://stackoverflow.com/questions/61146112/error-while-loading-config-you-appear-to-be-using-a-native-ecmascript-module-c
// https://stackoverflow.com/questions/50388367/jest-transformignorepatterns-all-node-modules-for-react-native-preset
// https://jestjs.io/docs/configuration#modulepathignorepatterns-arraystring

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
    ],
};
