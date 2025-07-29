'use server';
/**
 * @fileOverview AI-powered category suggestion for Mikel items.
 *
 * - suggestCategories - A function that suggests relevant categories for a given item.
 * - SuggestCategoriesInput - The input type for the suggestCategories function.
 * - SuggestCategoriesOutput - The return type for the suggestCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoriesInputSchema = z.object({
  itemContent: z.string().describe('El contenido del item a categorizar.'),
});
export type SuggestCategoriesInput = z.infer<typeof SuggestCategoriesInputSchema>;

const SuggestCategoriesOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('Un array de categorías sugeridas para el item.'),
});
export type SuggestCategoriesOutput = z.infer<typeof SuggestCategoriesOutputSchema>;

export async function suggestCategories(input: SuggestCategoriesInput): Promise<SuggestCategoriesOutput> {
  return suggestCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoriesPrompt',
  input: {schema: SuggestCategoriesInputSchema},
  output: {schema: SuggestCategoriesOutputSchema},
  prompt: `Eres un asistente experto en categorización para una herramienta de gestión de información personal llamada Mikel.

  Dado el contenido de un item, sugiere categorías relevantes para etiquetarlo.
  Responde con un array de strings en formato JSON. Las categorías deben ser en español, en minúsculas y de una sola palabra.

  Contenido del Item: {{{itemContent}}}`,
});

const suggestCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestCategoriesFlow',
    inputSchema: SuggestCategoriesInputSchema,
    outputSchema: SuggestCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
