import { type AutocompleteInteraction } from 'discord.js';
import { AutoComplete } from '../../structures/autoComplete';
import { fuzzySearch } from '../../misc/fuzzySearch';

export default {
    data: {
        name: 'blook',
    },
    async execute(interaction: AutocompleteInteraction<'cached'>) {
        const focusedValue = interaction.options.getFocused()

        const allBlookNames = (await interaction.client.prisma.blook.findMany({
            select: {
                name: true
            }
        })).map(pack => pack.name);

        const results = fuzzySearch(allBlookNames, focusedValue);

        await interaction.respond(results.map(result => ({ name: result, value: result })));
    }
} satisfies AutoComplete;
