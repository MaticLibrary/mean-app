const configuredPort = process.env.PORT ? Number(process.env.PORT) : 3100;

if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
    throw new RangeError("PORT must be an integer between 1 and 65535");
}

export const config = {
    port: configuredPort,
};
