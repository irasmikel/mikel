'use server';
import { suggestCategories } from '@/ai/flows/suggest-categories';
import type { SuggestCategoriesInput } from '@/ai/flows/suggest-categories';
import { searchItems } from '@/ai/flows/search-items';
import type { SearchItemsInput, SearchItemsOutput } from '@/ai/flows/search-items';


export async function getCategorySuggestions(input: SuggestCategoriesInput): Promise<string[]> {
  try {
    const result = await suggestCategories(input);
    return result.suggestedCategories || [];
  } catch (error) {
    console.error("Error getting category suggestions:", error);
    return [];
  }
}

export async function performSearch(input: SearchItemsInput): Promise<SearchItemsOutput> {
  try {
    const result = await searchItems(input);
    return result;
  } catch (error) {
    console.error("Error performing smart search:", error);
    return { itemIds: [] };
  }
}
