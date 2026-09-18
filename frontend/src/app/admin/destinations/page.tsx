'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Plus, Edit2, Trash2, Loader2, Star, X, Image as ImageIcon,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import {
  useDestinations, useCreateDestination, useUpdateDestination, useDeleteDestination,
  CreateDestinationInput,
} from '@/hooks/use-destinations';
import { ErrorState } from '@/components/ui/error-state';
import { Destination } from '@/lib/types';

const CATEGORIES = ['beach', 'wildlife', 'heritage', 'island', 'city', 'nature', 'culture'];

function blankForm(): CreateDestinationInput {
  return {
    name: '', category: '', region: '', description: '', shortDescription: '',
    images: [], highlights: [], isFeatured: false, latitude: undefined, longitude: undefined,
  };
}

function DestinationForm({
  initial,
  onSubmit,
  isPending,
  error,
}: {
  initial: CreateDestinationInput;
  onSubmit: (v: CreateDestinationInput) => void;
  isPending: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<CreateDestinationInput>(initial);
  const [imageInput, setImageInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  const set = (k: keyof CreateDestinationInput, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addImage = () => {
    const url = imageInput.trim();
    if (url) { set('images', [...(form.images || []), url]); setImageInput(''); }
  };
  const removeImage = (i: number) => set('images', (form.images || []).filter((_, idx) => idx !== i));

  const addHighlight = () => {
    const h = highlightInput.trim();
    if (h) { set('highlights', [...(form.highlights || []), h]); setHighlightInput(''); }
  };
  const removeHighlight = (i: number) => set('highlights', (form.highlights || []).filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-1">
      {error && (
        <div className="p-3 bg-danger-light border border-danger/20 rounded-xl flex items-start gap-2 text-xs font-semibold text-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Row 1: Name + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Input label="Name *" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Tiwai Island Wildlife Sanctuary" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">Category *</label>
          <select
            required value={form.category}
            onChange={e => set('category', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Region (full width) */}
      <Input label="Region / Province" value={form.region || ''} onChange={e => set('region', e.target.value)} placeholder="e.g. Moa River, Southern Province" />

      {/* Row 3: Short Description (full width) */}
      <div>
        <label className="block text-xs font-semibold text-text mb-1.5">
          Short Description <span className="font-normal text-text-muted">(shown on cards, max 255 chars)</span>
        </label>
        <input
          type="text"
          maxLength={255}
          value={form.shortDescription || ''}
          onChange={e => set('shortDescription', e.target.value)}
          placeholder="One-line summary shown on destination cards"
          className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Row 4: Full Description */}
      <div>
        <label className="block text-xs font-semibold text-text mb-1.5">Full Description</label>
        <textarea
          className="w-full h-24 p-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
          placeholder="Rich description of the destination…"
          value={form.description || ''}
          onChange={e => set('description', e.target.value)}
        />
      </div>

      {/* Row 5: Lat + Lng side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Latitude (optional)" type="number" step="any" value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="8.4606" />
        <Input label="Longitude (optional)" type="number" step="any" value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="-13.2317" />
      </div>

      {/* Row 6: Images */}
      <div className="pt-1 border-t border-border/50">
        <label className="block text-xs font-semibold text-text mb-2">
          <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-primary" />
          Images <span className="font-normal text-text-muted">(paste URL, press Enter or Add)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={imageInput}
            onChange={e => setImageInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            placeholder="https://images.unsplash.com/…"
            className="flex-1 h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          <Button type="button" variant="outline" size="sm" onClick={addImage}>Add</Button>
        </div>
        {(form.images || []).length > 0 && (
          <div className="mt-2 space-y-1.5">
            {(form.images || []).map((url, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-light rounded-lg text-xs">
                <img src={url} alt="" className="w-10 h-7 object-cover rounded shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="flex-1 truncate text-text-muted">{url}</span>
                <button type="button" onClick={() => removeImage(i)} className="text-danger hover:text-danger-dark"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 7: Highlights */}
      <div>
        <label className="block text-xs font-semibold text-text mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-success" />
          Highlights <span className="font-normal text-text-muted">(press Enter or Add)</span>
        </label>
        <div className="flex gap-2">
          <input
            value={highlightInput}
            onChange={e => setHighlightInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(); } }}
            placeholder="e.g. Community-managed eco-tourism"
            className="flex-1 h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          <Button type="button" variant="outline" size="sm" onClick={addHighlight}>Add</Button>
        </div>
        {(form.highlights || []).length > 0 && (
          <ul className="mt-2 space-y-1">
            {(form.highlights || []).map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-text-muted bg-slate-light rounded-lg px-3 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="flex-1">{h}</span>
                <button type="button" onClick={() => removeHighlight(i)} className="text-danger"><X className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.isFeatured || false} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
        <span className="text-sm font-semibold text-text flex items-center gap-1.5">
          <Star className="w-4 h-4 text-warning" /> Feature this destination on homepage
        </span>
      </label>

      <Button type="submit" variant="primary" size="lg" className="w-full font-bold mt-2" disabled={isPending} isLoading={isPending}>
        Save Destination
      </Button>
    </form>
  );
}

export default function AdminDestinationsPage() {
  const { data: destinations, isLoading, error, refetch } = useDestinations();
  const createMutation = useCreateDestination();
  const updateMutation = useUpdateDestination();
  const deleteMutation = useDeleteDestination();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Destination | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = (form: CreateDestinationInput) => {
    setFormError(null);
    createMutation.mutate(form, {
      onSuccess: () => { setIsAddOpen(false); },
      onError: (err: any) => setFormError(err.message || 'Failed to create destination.'),
    });
  };

  const handleUpdate = (form: CreateDestinationInput) => {
    if (!editTarget) return;
    setFormError(null);
    updateMutation.mutate({ id: editTarget.id, ...form }, {
      onSuccess: () => { setEditTarget(null); },
      onError: (err: any) => setFormError(err.message || 'Failed to update destination.'),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Destinations Management</h1>
            <p className="text-xs text-text-muted mt-1">
              Curate and publish official tourism destinations across Sierra Leone
            </p>
          </div>
          <Button variant="primary" size="md" className="font-bold gap-2" onClick={() => { setFormError(null); setIsAddOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Destination
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Destination Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(destinations || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-muted py-12">
                      No destinations yet. Click "Add Destination" to create the first one.
                    </TableCell>
                  </TableRow>
                )}
                {(destinations || []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      {d.images?.[0] ? (
                        <img src={d.images[0]} alt={d.name} className="w-14 h-10 object-cover rounded-lg" />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-slate-light flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-text-muted" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-text">{d.name}</div>
                      {d.shortDescription && <div className="text-xs text-text-muted truncate max-w-[220px]">{d.shortDescription}</div>}
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light text-primary capitalize">
                        {d.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted font-medium">{d.region || '—'}</TableCell>
                    <TableCell>
                      {d.isFeatured ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-warning">
                          <Star className="w-3.5 h-3.5 fill-warning" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionDropdown
                          items={[
                            {
                              label: 'Edit Destination',
                              icon: Edit2,
                              onClick: () => { setFormError(null); setEditTarget(d); },
                            },
                            {
                              label: 'Delete',
                              icon: Trash2,
                              variant: 'danger' as const,
                              onClick: () => setDeleteTarget(d),
                            },
                          ]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Destination" maxWidth="lg">
          <DestinationForm
            initial={blankForm()}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            error={formError}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Destination" maxWidth="lg">
          {editTarget && (
            <DestinationForm
              initial={{
                name: editTarget.name,
                category: editTarget.category,
                region: editTarget.region || '',
                description: editTarget.description || '',
                shortDescription: editTarget.shortDescription || '',
                images: editTarget.images || [],
                highlights: editTarget.highlights || [],
                isFeatured: editTarget.isFeatured || false,
                latitude: editTarget.latitude ?? undefined,
                longitude: editTarget.longitude ?? undefined,
              }}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              error={formError}
            />
          )}
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Destination?" maxWidth="sm">
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone and the page will stop being accessible to travelers.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="primary"
                className="flex-1 bg-danger hover:bg-danger-dark border-transparent text-white font-bold"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
