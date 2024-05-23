declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            CLIENT_ID: string;
            GUILD_ID: string;
            BASE_URL: string;
            SERVER_PORT: string;
            SERVER_DATABASE_HOST: string;
            SERVER_DATABASE_HOST: string;
            SERVER_DATABASE_PASSWORD: string;
            SERVER_DATABASE_NAME: string;
            RELATIVE_FILE_URL: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}



export { };