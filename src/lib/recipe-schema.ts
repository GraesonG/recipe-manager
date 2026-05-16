import { z } from 'zod';

export const ingredientInputSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(40).default(''),
  unit: z.string().max(40).default(''),
  isPantryStaple: z.boolean().optional(),
});

export const cookingInfoInputSchema = z.object({
  time: z.string().max(60).default(''),
  temp: z.string().max(60).default(''),
  description: z.string().max(500).default(''),
});

export const recipeInputSchema = z.object({
  name: z.string().min(1).max(200),
  servings: z.number().int().min(1).max(100),
  ingredients: z.array(ingredientInputSchema).min(1).max(50),
  cookingInfo: z.array(cookingInfoInputSchema).max(50),
  steps: z.array(z.string().min(1).max(1000)).min(1).max(50),
  sourceUrl: z.string().url().optional(),
});

export type RecipeInputSchema = z.infer<typeof recipeInputSchema>;
