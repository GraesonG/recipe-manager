'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeInput, ApiResponse } from '@/types';
import { Button, GlassPanel, Input } from '@/components/ui';

export const PREVIEW_STORAGE_KEY = 'recipe-import-preview';

interface ImportUrlModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportUrlModal({ open, onClose }: ImportUrlModalProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (submitting) return;
    setUrl('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await response.json()) as ApiResponse<RecipeInput>;
      if (!response.ok || !data.success || !data.data) {
        setError(data.error || 'Failed to import recipe');
        return;
      }
      window.sessionStorage.setItem(
        PREVIEW_STORAGE_KEY,
        JSON.stringify(data.data)
      );
      router.push('/recipes/new');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-url-title"
      onClick={handleClose}
    >
      <GlassPanel
        className="max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="import-url-title" className="text-xl font-semibold text-apple-label mb-2">
          Import from URL
        </h3>
        <p className="text-sm text-apple-label-secondary mb-4">
          Paste a recipe webpage URL. We&apos;ll extract the ingredients, steps, and timing — you can review and edit before saving.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://example.com/great-recipe"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
            required
          />

          {error && (
            <div className="text-sm text-apple-red bg-apple-red/10 border border-apple-red/30 rounded-glass-sm p-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !url.trim()}>
              {submitting ? 'Importing…' : 'Import'}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
