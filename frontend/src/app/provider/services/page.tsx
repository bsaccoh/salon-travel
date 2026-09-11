'use client';

import React, { useState } from 'react';
import { ProviderSidebar } from '@/components/dashboard/provider-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Calendar,
  Users,
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useMyServices, useCreateService, useDeleteService } from '@/hooks/use-services';
import { formatCurrency } from '@/lib/currency';
import { ErrorState } from '@/components/ui/error-state';
import { FileDropzone } from '@/components/ui/file-dropzone';

export default function ProviderServicesPage() {
  const { data: services, isLoading, error, refetch } = useMyServices();
  const createService = useCreateService();
  const deleteService = useDeleteService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    createService.mutate(
      {
        name: newServiceName,
        description: newServiceDescription || undefined,
        priceCents: Math.round(parseFloat(newServicePrice) * 100),
        durationMinutes: parseInt(newServiceDuration) * 60 || 240,
        type: 'excursion',
        currency: 'SLE',
        isAvailable: true,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        cancellationPolicy: 'flexible',
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setNewServiceName('');
          setNewServicePrice('');
          setNewServiceDuration('');
          setNewServiceDescription('');
          setUploadedImages([]);
        },
      },
    );
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    if (minutes >= 60) return `${Math.round(minutes / 60)} Hours`;
    return `${minutes} Min`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <ProviderSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">Service Catalog</h1>
            <p className="text-xs text-text-muted mt-1">
              Create and manage your bookable travel experiences and excursions
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            className="font-bold gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </Button>
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !services?.length ? (
          <div className="p-12 rounded-2xl border border-border bg-surface text-center space-y-4 shadow-subtle">
            <Calendar className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-lg font-bold text-text">No services yet</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Add your first bookable excursion or transfer to start receiving traveler bookings.
            </p>
            <Button
              variant="primary"
              size="md"
              className="font-bold gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Service</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-6 rounded-2xl border border-border bg-surface shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      s.isAvailable
                        ? 'text-success bg-success-light'
                        : 'text-text-muted bg-border/30'
                    }`}>
                      {s.isAvailable ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-base font-extrabold text-primary-dark">
                      {formatCurrency(s.priceCents)} / person
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text mb-2">{s.name}</h3>
                  {s.description && (
                    <p className="text-xs text-text-muted leading-relaxed mb-4">{s.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatDuration(s.durationMinutes)}
                    </span>
                    {s.maxCapacity && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        Up to {s.maxCapacity} guests
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit2 className="w-3.5 h-3.5 text-text-muted" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger-light"
                    onClick={() => deleteService.mutate(s.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Service Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Service Listing"
          description="Add a new bookable excursion or transfer to your catalog"
          maxWidth="md"
        >
          <form onSubmit={handleCreateService} className="space-y-4 mt-2">
            <Input
              label="Service Title"
              placeholder="e.g. Tacugama Rainforest Guided Walk"
              required
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                Service Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the experience, highlights, meeting point, and what's included..."
                value={newServiceDescription}
                onChange={(e) => setNewServiceDescription(e.target.value)}
                className="flex w-full rounded-lg border border-border bg-surface p-3 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price Per Person (Le)"
                type="number"
                placeholder="1500"
                required
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
              />
              <Input
                label="Duration (Hours)"
                placeholder="4"
                required
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
              />
            </div>

            <FileDropzone
              folder="services"
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              maxSizeMB={10}
              label="Excursion Photos"
              description="Upload high-res photo for the service card (JPEG, PNG, WebP)"
              onUploadSuccess={(res) => setUploadedImages((prev) => [...prev, res.url])}
            />

            <Button
              type="submit"
              variant="traveler-cta"
              size="lg"
              className="w-full font-bold mt-2"
              disabled={createService.isPending}
            >
              {createService.isPending ? 'Creating...' : 'Save & Publish Service'}
            </Button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
