"use client";

import React from 'react';
import { Separator } from "@/components/ui/separator";
import { useSidebar } from '@/hooks/useSidebar';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { ChannelsSection } from './sidebar/ChannelsSection';
import { MobileSidebar } from './sidebar/MobileSidebar';
import { EditCommunityModal } from "../form/editCommunity";

export function Sidebar() {
  const {
    // State
    isChannelOpen,
    setIsChannelOpen,
    isEventDialogOpen,
    setIsEventDialogOpen,
    selectedChannelId,
    setSelectedChannelId,
    showDeleteDialog,
    setShowDeleteDialog,
    isEditOpen,
    setIsEditOpen,
    formData,
    setFormData,
    
    // Computed
    isAdmin,
    communityParam,
    navigationPaths,
    channels,
    
    // Data
    communityDetails,
    isLoadingCommunity,
    communityError,
    isLoadingChannels,
    channelsError,
    memberDetails,
    activeChannel,
    
    // Handlers
    handleNavigation,
    handleChannelNavigation,
    handleCreateChannel,
    handleDeleteChannel,
    isPathActive,
    
    // Loading states
    isCreatingChannel,
    isDeletingChannel,
  } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="md:fixed md:h-screen md:w-80 md:bg-card md:p-4 md:py-24 md:flex flex-col hidden">
        <div className="flex items-center justify-between px-2">
          {isLoadingCommunity ? (
            <div className="h-6 w-32 bg-background animate-pulse rounded" />
          ) : communityError ? (
            <h2 className="text-lg text-red-500">Error loading community</h2>
          ) : (
            <h2 className="text-lg text-muted-foreground font-semibold">
              {communityDetails?.name}
            </h2>
          )}
        </div>

        <Separator />
        
        <SidebarNavigation
          isAdmin={isAdmin}
          navigationPaths={navigationPaths}
          isPathActive={isPathActive}
          handleNavigation={handleNavigation}
        />

        <ChannelsSection
          channels={channels}
          activeChannelId={activeChannel?.id || ''}
          isAdmin={isAdmin}
          isChannelOpen={isChannelOpen}
          setIsChannelOpen={setIsChannelOpen}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
          formData={formData}
          setFormData={setFormData}
          isCreatingChannel={isCreatingChannel}
          handleChannelNavigation={handleChannelNavigation}
          handleCreateChannel={handleCreateChannel}
          handleDeleteChannel={handleDeleteChannel}
        />

        {isEditOpen && (
          <EditCommunityModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        navigationPaths={navigationPaths}
        channels={channels}
        isPathActive={isPathActive}
        handleNavigation={handleNavigation}
        handleChannelNavigation={handleChannelNavigation}
      />
    </>
  );
}
