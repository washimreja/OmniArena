'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useSidebar } from '@/hooks/use-sidebar';
import { ConversationStoreProvider } from '@/features/conversations/conversation-store';
import { ConnectorProvider } from '@/features/connectors/connector-context';
import { ManageConnectorsModal } from '@/components/connectors/ManageConnectorsModal';
interface AppShellProps {
  children: React.ReactNode;
  topNavTitle?: string;
}

export function AppShell({ children, topNavTitle }: AppShellProps) {
  const { isOpen, toggle } = useSidebar(true);

  return (
    <ConversationStoreProvider>
      <ConnectorProvider>
        <div className="flex h-screen bg-bg-base overflow-hidden">
          <Sidebar isOpen={isOpen} onToggle={toggle} />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopNav onMenuClick={toggle} title={topNavTitle} />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <ManageConnectorsModal />
      </ConnectorProvider>
    </ConversationStoreProvider>
  );
}
