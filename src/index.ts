import { ExtendedClient } from './structures/client';
import 'dotenv/config'

const client = new ExtendedClient();
client.start();