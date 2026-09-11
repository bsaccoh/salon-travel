import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Construction } from 'lucide-react';

export default function CatchAllConciergePage({ params }: { params: { slug: string[] } }) {
  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />

      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC] p-8">
        <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-primary-light text-primary-dark rounded-full flex items-center justify-center mb-2">
            <Construction className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-text">Page Under Construction</h1>
          <p className="text-text-muted">
            The module for <strong>/concierge/{params.slug.join('/')}</strong> is currently being built in a future phase.
          </p>
          <a href="/concierge/inbox" className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors">
            Return to Inbox
          </a>
        </div>
      </main>
    </div>
  );
}
