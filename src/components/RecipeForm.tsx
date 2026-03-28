'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RecipeInput, IngredientInput, CookingInfoInput } from '@/types';
import { createEmptyRecipeInput, validateRecipeInput, recipeToInput } from '@/lib/utils';
import { createRecipe, updateRecipe } from '@/lib/api';
import { Button, Input, TextArea, GlassPanel } from '@/components/ui';

interface RecipeFormProps {
  initialData?: RecipeInput;
  recipeId?: string; // If editing, pass the recipe ID
  mode: 'create' | 'edit';
}

export function RecipeForm({ initialData, recipeId, mode }: RecipeFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<RecipeInput>(
    initialData || createEmptyRecipeInput()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update basic fields
  const updateField = <K extends keyof RecipeInput>(
    field: K,
    value: RecipeInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Ingredient handlers
  const updateIngredient = (
    index: number,
    field: keyof IngredientInput,
    value: string
  ) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    updateField('ingredients', newIngredients);
  };

  const addIngredient = () => {
    updateField('ingredients', [
      ...formData.ingredients,
      { name: '', quantity: '', unit: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      updateField('ingredients', newIngredients);
    }
  };

  // Cooking info handlers
  const updateCookingInfo = (
    index: number,
    field: keyof CookingInfoInput,
    value: string
  ) => {
    const newCookingInfo = [...formData.cookingInfo];
    newCookingInfo[index] = { ...newCookingInfo[index], [field]: value };
    updateField('cookingInfo', newCookingInfo);
  };

  const addCookingInfo = () => {
    updateField('cookingInfo', [
      ...formData.cookingInfo,
      { time: '', temp: '', description: '' },
    ]);
  };

  const removeCookingInfo = (index: number) => {
    if (formData.cookingInfo.length > 1) {
      const newCookingInfo = formData.cookingInfo.filter((_, i) => i !== index);
      updateField('cookingInfo', newCookingInfo);
    }
  };

  // Step handlers
  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    updateField('steps', newSteps);
  };

  const addStep = () => {
    updateField('steps', [...formData.steps, '']);
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      updateField('steps', newSteps);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate
    const validationErrors = validateRecipeInput(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'edit' && recipeId) {
        await updateRecipe(recipeId, formData);
        router.push(`/recipes/${recipeId}`);
      } else {
        const newRecipe = await createRecipe(formData);
        router.push(`/recipes/${newRecipe.id}`);
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to save recipe']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Display */}
      {errors.length > 0 && (
        <GlassPanel className="p-4 border-apple-red/30 bg-apple-red/10">
          <h3 className="text-apple-red font-medium mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside text-apple-red/80 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {/* Basic Info Section */}
      <GlassPanel className="p-6">
        <h2 className="text-xl font-semibold text-apple-label mb-6">
          Basic Information
        </h2>

        <div className="space-y-4">
          <Input
            label="Recipe Name"
            placeholder="e.g., Pasta Carbonara"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <div className="w-32">
            <Input
              label="Servings"
              type="number"
              min={1}
              value={formData.servings}
              onChange={(e) => updateField('servings', parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </div>
      </GlassPanel>

      {/* Ingredients Section */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-apple-label">Ingredients</h2>
          <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Ingredient
            </span>
          </Button>
        </div>

        <div className="space-y-3">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                />
              </div>
              <div className="w-24">
                <Input
                  placeholder="Qty"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                />
              </div>
              <div className="w-28">
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(index)}
                disabled={formData.ingredients.length <= 1}
                className="mt-1 text-apple-label-tertiary hover:text-apple-red"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Cooking Info Section */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-apple-label">Cooking Information</h2>
            <p className="text-sm text-apple-label-secondary mt-1">
              Add time, temperature, and description for each cooking step
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addCookingInfo}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Cooking Step
            </span>
          </Button>
        </div>

        <div className="space-y-4">
          {formData.cookingInfo.map((info, index) => (
            <div key={index} className="glass-panel-subtle p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-apple-label-secondary">
                  Cooking Step {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCookingInfo(index)}
                  disabled={formData.cookingInfo.length <= 1}
                  className="text-apple-label-tertiary hover:text-apple-red"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Time (e.g., 30 min)"
                  value={info.time}
                  onChange={(e) => updateCookingInfo(index, 'time', e.target.value)}
                />
                <Input
                  placeholder="Temp (e.g., 350°F)"
                  value={info.temp}
                  onChange={(e) => updateCookingInfo(index, 'temp', e.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={info.description}
                  onChange={(e) => updateCookingInfo(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Steps Section */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-apple-label">Instructions</h2>
          <Button type="button" variant="ghost" size="sm" onClick={addStep}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Step
            </span>
          </Button>
        </div>

        <div className="space-y-4">
          {formData.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-apple-blue/20 text-apple-blue flex items-center justify-center text-sm font-medium flex-shrink-0 mt-2">
                {index + 1}
              </div>
              <div className="flex-1">
                <TextArea
                  placeholder={`Step ${index + 1} instructions...`}
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStep(index)}
                disabled={formData.steps.length <= 1}
                className="mt-2 text-apple-label-tertiary hover:text-apple-red"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href={mode === 'edit' && recipeId ? `/recipes/${recipeId}` : '/'}>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </Link>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : mode === 'edit' ? (
            'Update Recipe'
          ) : (
            'Create Recipe'
          )}
        </Button>
      </div>
    </form>
  );
}
