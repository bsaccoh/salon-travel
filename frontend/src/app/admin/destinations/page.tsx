'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { ActionDropdown } from '@/components/ui/dropdown';
import { useDestinations, useCreateDestination } from '@/hooks/use-destinations';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminDestinationsPage() {
  const { data: destinations, isLoading, error, refetch } = useDestinations();
  const createDestination = useCreateDestination();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newRegion, setNewRegion] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCategory) return;
    createDestination.mutate(
      { name: newName, category: newCategory, region: newRegion || undefined },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setNewName('');
          setNewCategory('');
          setNewRegion('');
        },
      },
    );
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

          <Button
            variant="primary"
            size="md"
            className="font-bold gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
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
                  <TableHead>Destination Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Region / Location</TableHead>
                  <TableHead>Page Views</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(destinations || []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-bold text-text">{d.name}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light text-primary">
                        {d.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted font-medium">{d.region}</TableCell>
                    <TableCell className="font-mono text-xs">{d.viewCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ActionDropdown
                          items={[
                            {
                              label: 'Edit Destination',
                              icon: Edit2,
                              onClick: () => {},
                            },
                            {
                              label: 'Delete',
                              icon: Trash2,
                              variant: 'danger' as const,
                              onClick: () => {},
                            }
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

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Destination Listing"
          description="Publish a new tourist destination with category and coordinates"
        >
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <Input
              label="Destination Name"
              placeholder="e.g. Tiwai Island Wildlife Sanctuary"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Category"
              placeholder="e.g. Wildlife, Beach, Heritage, Island"
              required
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              label="Region / Province"
              placeholder="e.g. Moa River, Southern Province"
              required
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
            />
            <Button type="submit" variant="traveler-cta" size="lg" className="w-full font-bold mt-2">
              Save Destination
            </Button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
