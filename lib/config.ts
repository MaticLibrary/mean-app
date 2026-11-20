const configuredPort = process.env.PORT ? Number(process.env.PORT) : 3100;

if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
    throw new RangeError('PORT must be an integer between 1 and 65535');
}

export const config = {
    port: configuredPort,
    supportedPostCount: 15,
    databaseUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mean-app',
};
