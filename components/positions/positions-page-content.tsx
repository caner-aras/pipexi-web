"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PositionDrawer } from "@/components/positions/position-drawer";
import { PositionList } from "@/components/positions/position-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Position } from "@/types/position";

interface PositionsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  currency?: string;
  positions: Position[];
  error: string | null;
}

export function PositionsPageContent({
  organizationId,
  organizationName,
  currency,
  positions,
  error,
}: PositionsPageContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [createDefaults, setCreateDefaults] = useState<Pick<
    Position,
    "title" | "defaultHourlyRate" | "description"
  > | null>(null);

  function handleAddPosition() {
    setEditingPosition(null);
    setCreateDefaults(null);
    setDrawerOpen(true);
  }

  function handleEditPosition(position: Position) {
    setCreateDefaults(null);
    setEditingPosition(position);
    setDrawerOpen(true);
  }

  function handleDuplicatePosition(position: Position) {
    setEditingPosition(null);
    setCreateDefaults({
      title: `${position.title} Copy`,
      defaultHourlyRate: position.defaultHourlyRate,
      description: position.description,
    });
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingPosition(null);
      setCreateDefaults(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Positions"
        description={
          organizationName
            ? `Job position definitions and hourly rates for ${organizationName}.`
            : "Job position definitions and hourly rates."
        }
        actions={
          <Button size="sm" onClick={handleAddPosition}>
            <Plus className="size-4" />
            New position
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : positions.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No positions found"
            description="Create your first position definition to get started."
            action={
              <Button size="sm" onClick={handleAddPosition}>
                <Plus className="size-4" />
                New position
              </Button>
            }
          />
        ) : (
          <PositionList
            positions={positions}
            onEditPosition={handleEditPosition}
            onDuplicatePosition={handleDuplicatePosition}
          />
        )}
      </div>

      <PositionDrawer
        organizationId={organizationId}
        currency={currency}
        position={editingPosition}
        defaults={createDefaults}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />
    </>
  );
}
