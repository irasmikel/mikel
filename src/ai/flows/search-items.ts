'use server';
/**
 * @fileOverview An AI-powered search flow for Mikel items.
 *
 * - searchItems - A function that searches through items based on a natural language query.
 * - SearchItemsInput - The input type for the searchItems function.
 * - SearchItemsOutput - The return type for the searchItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchableItemSchema = z.object({
  id: z.string(),
  type: z.enum(['note', 'password', 'photo', 'application']),
  title: z.string(),
  content: z.string(),
  categories: z.array(z.string()),
});

const SearchItemsInputSchema = z.object({
  query: z.string().describe('La consulta de búsqueda en lenguaje natural.'),
  items: z.array(SearchableItemSchema).describe('La lista de todos los items para buscar.'),
});
export type SearchItemsInput = z.infer<typeof SearchItemsInputSchema>;

const SearchItemsOutputSchema = z.object({
  itemIds: z.array(z.string()).describe('Un array de IDs de los items que coinciden con la búsqueda.'),
});
export type SearchItemsOutput = z.infer<typeof SearchItemsOutputSchema>;


export async function searchItems(input: SearchItemsInput): Promise<SearchItemsOutput> {
  return searchItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchItemsPrompt',
  input: {schema: SearchItemsInputSchema},
  output: {schema: SearchItemsOutputSchema},
  prompt: `Eres un asistente de búsqueda inteligente para una herramienta de gestión de información personal llamada Mikel.
Tu tarea es encontrar los items más relevantes de una lista proporcionada, basándote en la consulta de búsqueda de un usuario.

Analiza la consulta del usuario: "{{query}}"

Busca en los siguientes items y devuelve los IDs de los que sean más relevantes. Considera el título, el contenido y las categorías de cada item. La consulta puede ser una simple palabra clave, una pregunta o una descripción.

Si la consulta es "todas las contraseñas", debes devolver todos los items de tipo 'password'.
Si la consulta es "todas las aplicaciones", debes devolver todos los items de tipo 'application'.
Si la consulta es específica, como "contraseña de amenabar", debes devolver el item específico.
Si la consulta es sobre un tema, como "procedimientos de konica", devuelve todos los items que coincidan con eso.

Devuelve SOLAMENTE los IDs de los items que coinciden en el formato JSON especificado.

Items Disponibles:
{{#each items}}
- ID: {{id}}
  Type: {{type}}
  Title: {{title}}
  Categories: {{#each categories}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
  Content: """{{content}}"""
---
{{/each}}
`,
});

const searchItemsFlow = ai.defineFlow(
  {
    name: 'searchItemsFlow',
    inputSchema: SearchItemsInputSchema,
    outputSchema: SearchItemsOutputSchema,
  },
  async input => {
    if (input.items.length === 0) {
      return { itemIds: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
