import { ExtendedClient } from './structures/client';
import { config } from 'dotenv'

config({ path: '../.env' })

// hacky way to get the media path to work
process.env.VITE_MEDIA_URL = process.env.SERVER_BASE_URL + process.env.VITE_MEDIA_URL;

const client = new ExtendedClient();
client.start();
