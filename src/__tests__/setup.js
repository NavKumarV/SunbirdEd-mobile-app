require('reflect-metadata');
require('babel-polyfill');

global.cordova = {
    plugins: {
        notification: {
            local: {
                lanchDetails: {},
                getScheduledIds: () => {},
                schedule: () => {}
            }
        },
        diagnostic: {
            switchToSettings: () => {}
        }
    },
    file: {
        applicationDirectory: "/path"
    },  
    InAppBrowser: {
        open: () => ({
            addEventListener: () => {},
        }),
    }
};

global.supportfile = {
    shareSunbirdConfigurations: () => {}
}

global.FCMPlugin = {
    subscribeToTopic: (topic, success, error) => {
        setTimeout(() => {
            success();
          });
    },
    unsubscribeFromTopic: (topic, success, error) => {
        setTimeout(() => {
            success();
          });
    }
}
