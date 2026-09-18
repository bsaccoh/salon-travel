'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminTopbar } from '@/components/dashboard/admin-topbar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Search, Loader2, Package, Clock, Users, Plus, Pencil, Trash2,
  AlertCircle, X, CheckCircle2, ImageIcon, Sparkles,
} from 'lucide-react';
import {
  useAdminServices, useAdminCreateService, useAdminUpdateService,
  useAdminDeleteService, useAdminSeedDemoData,
} from '@/hooks/use-admin';
import { useAdminProviders } from '@/hooks/use-admin';
import { ErrorState } from '@/components/ui/error-state';

const SERVICE_TYPES = [
  'tour', 'accommodation', 'transfer', 'rental', 'guide',
  'meal', 'boat_trip', 'experience', 'event',
];

function formatPrice(cents: number, currency = 'SLE') {
  return `Le ${(cents / 100).toLocaleString()}`;
}

function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

interface ServiceForm {
  providerId: string;
  name: string;
  type: string;
  description: string;
  shortDescription: string;
  priceCents: number | '';
  currency: string;
  durationMinutes: number | '';
  maxCapacity: number | '';
  images: string[];
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
}

function emptyForm(): ServiceForm {
  return {
    providerId: '', name: '', type: 'tour', description: '', shortDescription: '',
    priceCents: '', currency: 'SLE', durationMinutes: '', maxCapacity: '',
    images: [], inclusions: [], exclusions: [], isActive: true,
  };
}

function priceLeToSLE(leStr: string): number {
  return Math.round(parseFloat(leStr || '0') * 100);
}

function sleToPriceLe(cents: number): string {
  return (cents / 100).toString();
}

function ServiceForm({
  form, setForm, onSubmit, onCancel, isPending, providers, error,
}: {
  form: ServiceForm;
  setForm: (f: ServiceForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  providers: any[];
  error: string;
}) {
  const [imageInput, setImageInput] = useState('');
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');

  const set = (k: keyof ServiceForm, v: any) => setForm({ ...form, [k]: v });

  const addImage = () => {
    const url = imageInput.trim();
    if (url) { set('images', [...form.images, url]); setImageInput(''); }
  };
  const removeImage = (i: number) => set('images', form.images.filter((_, idx) => idx !== i));

  const addItem = (list: 'inclusions' | 'exclusions', val: string) => {
    if (val.trim()) set(list, [...form[list], val.trim()]);
  };
  const removeItem = (list: 'inclusions' | 'exclusions', i: number) =>
    set(list, form[list].filter((_, idx) => idx !== i));

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-1">
      {error && (
        <div className="p-3 bg-danger-light border border-danger/20 rounded-xl flex items-start gap-2 text-xs font-semibold text-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Provider */}
      <div>
        <label className="block text-xs font-semibold text-text mb-1.5">Provider *</label>
        <select
          required value={form.providerId}
          onChange={e => set('providerId', e.target.value)}
          className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">Select provider…</option>
          {(providers || []).map((p: any) => (
            <option key={p.id} value={p.id}>{p.businessName}</option>
          ))}
        </select>
      </div>

      {/* Name + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Input label="Package Name *" required value={form.name}
            onChange={e => set('name', e.target.value)} placeholder="e.g. Banana Islands Snorkeling" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">Type *</label>
          <select
            required value={form.type}
            onChange={e => set('type', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary capitalize"
          >
            {SERVICE_TYPES.map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-semibold text-text mb-1.5">
          Short Description <span className="font-normal text-text-muted">(shown on cards, max 255 chars)</span>
        </label>
        <input
          type="text" maxLength={255} value={form.shortDescription}
          onChange={e => set('shortDescription', e.target.value)}
          placeholder="One-line summary for package cards"
          className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-xs font-semibold text-text mb-1.5">Full Description</label>
        <textarea
          className="w-full h-24 p-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
          placeholder="Detailed description of what's included…"
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>

      {/* Price + Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">Price (Le) *</label>
          <input
            type="number" min="0" step="0.01" required
            value={form.priceCents !== '' ? sleToPriceLe(form.priceCents as number) : ''}
            onChange={e => set('priceCents', e.target.value ? priceLeToSLE(e.target.value) : '')}
            placeholder="e.g. 165000"
            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">Currency</label>
          <select
            value={form.currency} onChange={e => set('currency', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
          >
            <option value="SLE">SLE (Sierra Leonean Leone)</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Duration + Capacity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">Duration (minutes)</label>
          <input
            type="number" min="1"
            value={form.durationMinutes}
            onChange={e => set('durationMinutes', e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 360 (6 hours)"
            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">Max Capacity</label>
          <input
            type="number" min="1"
            value={form.maxCapacity}
            onChange={e => set('maxCapacity', e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 8"
            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Images */}
      <div className="pt-1 border-t border-border/50">
        <label className="block text-xs font-semibold text-text mb-2">
          <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-primary" />
          Images <span className="font-normal text-text-muted">(paste URL, press Enter)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url" value={imageInput}
            onChange={e => setImageInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            placeholder="https://images.unsplash.com/…"
            className="flex-1 h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          <Button type="button" variant="outline" size="sm" onClick={addImage}>Add</Button>
        </div>
        {form.images.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-light rounded-lg text-xs">
                <img src={url} alt="" className="w-10 h-7 object-cover rounded shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="flex-1 truncate text-text-muted">{url}</span>
                <button type="button" onClick={() => removeImage(i)} className="text-danger"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inclusions */}
      <div>
        <label className="block text-xs font-semibold text-text mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-success" />
          What's Included
        </label>
        <div className="flex gap-2">
          <input
            value={inclusionInput}
            onChange={e => setInclusionInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem('inclusions', inclusionInput); setInclusionInput(''); } }}
            placeholder="e.g. Local guide included"
            className="flex-1 h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => { addItem('inclusions', inclusionInput); setInclusionInput(''); }}>Add</Button>
        </div>
        {form.inclusions.length > 0 && (
          <ul className="mt-2 space-y-1">
            {form.inclusions.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-success bg-success-light rounded-lg px-3 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-text">{h}</span>
                <button type="button" onClick={() => removeItem('inclusions', i)} className="text-danger"><X className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Exclusions */}
      <div>
        <label className="block text-xs font-semibold text-text mb-2">
          <X className="w-3.5 h-3.5 inline mr-1 text-danger" />
          What's Not Included
        </label>
        <div className="flex gap-2">
          <input
            value={exclusionInput}
            onChange={e => setExclusionInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem('exclusions', exclusionInput); setExclusionInput(''); } }}
            placeholder="e.g. Personal drinks"
            className="flex-1 h-10 px-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => { addItem('exclusions', exclusionInput); setExclusionInput(''); }}>Add</Button>
        </div>
        {form.exclusions.length > 0 && (
          <ul className="mt-2 space-y-1">
            {form.exclusions.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-danger bg-danger-light rounded-lg px-3 py-1.5">
                <X className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-text">{h}</span>
                <button type="button" onClick={() => removeItem('exclusions', i)} className="text-danger"><X className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer pt-1">
        <input type="checkbox" checked={form.isActive}
          onChange={e => set('isActive', e.target.checked)}
          className="w-4 h-4 rounded border-border accent-primary" />
        <span className="text-sm font-semibold text-text">Active (visible to travelers)</span>
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" className="flex-1 font-bold" disabled={isPending} isLoading={isPending}>
          Save Package
        </Button>
      </div>
    </form>
  );
}

export default function AdminServicesPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formError, setFormError] = useState('');
  const [seedSuccess, setSeedSuccess] = useState('');
  const [createForm, setCreateForm] = useState<ServiceForm>(emptyForm());

  const { data: services, isLoading, error, refetch } = useAdminServices({
    type: typeFilter || undefined,
    search: search || undefined,
  });
  const { data: providers } = useAdminProviders();
  const createMutation = useAdminCreateService();
  const updateMutation = useAdminUpdateService();
  const deleteMutation = useAdminDeleteService();
  const seedMutation = useAdminSeedDemoData();

  const filtered = services || [];

  function formToPayload(f: ServiceForm) {
    return {
      providerId: f.providerId,
      name: f.name,
      type: f.type,
      description: f.description || undefined,
      shortDescription: f.shortDescription || undefined,
      priceCents: f.priceCents as number,
      currency: f.currency,
      durationMinutes: f.durationMinutes !== '' ? f.durationMinutes as number : undefined,
      maxCapacity: f.maxCapacity !== '' ? f.maxCapacity as number : undefined,
      images: f.images,
      inclusions: f.inclusions,
      exclusions: f.exclusions,
      isActive: f.isActive,
    };
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await createMutation.mutateAsync(formToPayload(createForm));
      setShowCreate(false);
      setCreateForm(emptyForm());
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create package');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!editTarget) return;
    try {
      const payload = formToPayload(editTarget._form);
      await updateMutation.mutateAsync({ id: editTarget.id, ...payload });
      setEditTarget(null);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update package');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {}
  };

  const handleSeed = async () => {
    setSeedSuccess('');
    try {
      const res = await seedMutation.mutateAsync();
      const r = (res as any)?.data ?? res;
      setSeedSuccess(`Seeded ${r.destinations ?? 0} destinations and ${r.services ?? 0} packages.`);
      refetch();
    } catch {}
  };

  const openEdit = (s: any) => {
    setFormError('');
    setEditTarget({
      ...s,
      _form: {
        providerId: s.providerId || s.provider?.id || '',
        name: s.name || '',
        type: s.type || 'tour',
        description: s.description || '',
        shortDescription: s.shortDescription || '',
        priceCents: s.priceCents ?? '',
        currency: s.currency || 'SLE',
        durationMinutes: s.durationMinutes ?? '',
        maxCapacity: s.maxCapacity ?? '',
        images: s.images || [],
        inclusions: s.inclusions || [],
        exclusions: s.exclusions || [],
        isActive: s.isActive ?? true,
      } as ServiceForm,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <AdminTopbar
          title="Packages"
          subtitle="All travel packages and services in the marketplace"
        />

        <div className="flex items-center gap-2 mb-5 -mt-2">
          <Button
            variant="outline" size="sm"
            onClick={handleSeed}
            disabled={seedMutation.isPending}
            isLoading={seedMutation.isPending}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Load Demo Data
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setFormError(''); setCreateForm(emptyForm()); setShowCreate(true); }}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Package
          </Button>
        </div>

        {seedSuccess && (
          <div className="mb-4 p-3 bg-success-light border border-success/20 rounded-xl flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="w-4 h-4" />{seedSuccess}
          </div>
        )}

        {seedMutation.isError && (
          <div className="mb-4 p-3 bg-danger-light border border-danger/20 rounded-xl flex items-center gap-2 text-sm font-semibold text-danger">
            <AlertCircle className="w-4 h-4" />Failed to load demo data. Make sure you are signed in as admin.
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface rounded-xl p-4 border border-border shadow-subtle mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-72 px-3 py-2 rounded-lg bg-background border border-border">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search packages…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs text-text focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto flex-wrap">
            {['', ...SERVICE_TYPES].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap capitalize ${
                  typeFilter === t ? 'bg-primary-dark text-white' : 'bg-background text-text-muted hover:text-text'
                }`}
              >
                {t ? t.replace('_', ' ') : 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-text-muted border border-dashed border-border rounded-2xl">
            <Package className="w-14 h-14 mb-4 text-border" />
            <h2 className="text-lg font-bold text-text mb-1">No packages yet</h2>
            <p className="text-sm text-center max-w-sm mb-6">
              Click "Load Demo Data" to seed 7 real Sierra Leone tour packages, or create your own.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSeed} disabled={seedMutation.isPending} isLoading={seedMutation.isPending}>
                <Sparkles className="w-4 h-4 mr-1.5" />Load Demo Data
              </Button>
              <Button variant="primary" onClick={() => { setCreateForm(emptyForm()); setShowCreate(true); }}>
                <Plus className="w-4 h-4 mr-1.5" />New Package
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cap.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {s.images?.[0] && (
                          <img src={s.images[0]} alt="" className="w-10 h-8 object-cover rounded-lg shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-text text-sm leading-tight">{s.name}</p>
                          {s.shortDescription && (
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-1 max-w-xs">{s.shortDescription}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">
                      {s.provider?.businessName || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light text-primary capitalize">
                        {s.type?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-text text-sm whitespace-nowrap">
                      {formatPrice(s.priceCents, s.currency)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />
                        {formatDuration(s.durationMinutes)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.maxCapacity ? (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Users className="w-3 h-3" />{s.maxCapacity}
                        </span>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        s.isActive !== false ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                      }`}>
                        {s.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title="New Package"
          maxWidth="lg"
        >
          <ServiceForm
            form={createForm}
            setForm={setCreateForm}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
            providers={providers || []}
            error={formError}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          title="Edit Package"
          maxWidth="lg"
        >
          {editTarget && (
            <ServiceForm
              form={editTarget._form}
              setForm={f => setEditTarget({ ...editTarget, _form: f })}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
              isPending={updateMutation.isPending}
              providers={providers || []}
              error={formError}
            />
          )}
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Package"
        >
          {deleteTarget && (
            <div className="space-y-5">
              <p className="text-sm text-text-muted">
                Permanently delete <strong className="text-text">{deleteTarget.name}</strong>?
                This cannot be undone and will affect any existing bookings.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
                <Button
                  variant="danger"
                  className="flex-1 font-bold"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  isLoading={deleteMutation.isPending}
                >
                  Delete Package
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
