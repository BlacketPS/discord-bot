import { ColorResolvable, EmbedBuilder } from "discord.js";

export enum SemType {
    ERROR,
    INFO
} 

interface SemOptions {
    type: SemType;

    title: string;

    description: string;

    color?: ColorResolvable;
};

/**
 * Simple Embed Maker v1.0.0
 * ---
 * Create simple embeds for use in Discord bots
 * (these embeds should mainly be used for just providing a better user experience, nothing spectacular)
 */
export default function(semOptions: SemOptions) {
    const isError = semOptions.type === SemType.ERROR;
    return new EmbedBuilder()
        .setTitle(isError ? `❗ Error: ${semOptions.title} ❗` : semOptions.title)
        .setDescription(semOptions.description)
        .setColor(semOptions.color ?? isError ? 0x990000 : 0x000080);
}