"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BlockWrapper } from "./blocks/BlockWrapper"
import { HeadlineBlock } from "./blocks/HeadlineBlock"
import { SubheadlineBlock } from "./blocks/SubheadlineBlock"
import { BookCoverBlock } from "./blocks/BookCoverBlock"
import { LeadFormBlock } from "./blocks/LeadFormBlock"
import { TestimonialBlock } from "./blocks/TestimonialBlock"
import { CTAButtonBlock } from "./blocks/CTAButtonBlock"
import { VideoBlock } from "./blocks/VideoBlock"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export type BlockType =
  | "headline"
  | "subheadline"
  | "book-cover"
  | "lead-form"
  | "testimonial"
  | "cta"
  | "video"

export interface Block {
  id: string
  type: BlockType
  data: any
}

interface FunnelCanvasProps {
  blocks: Block[]
  selectedBlockId: string | null
  onBlocksChange: (blocks: Block[]) => void
  onSelectBlock: (blockId: string | null) => void
  onEditBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  onAddBlock: (type: BlockType) => void
}

function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const renderBlockContent = () => {
    const dragHandleProps = {
      ...attributes,
      ...listeners,
    }

    switch (block.type) {
      case "headline":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <HeadlineBlock {...block.data} />
          </BlockWrapper>
        )
      case "subheadline":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <SubheadlineBlock {...block.data} />
          </BlockWrapper>
        )
      case "book-cover":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <BookCoverBlock {...block.data} />
          </BlockWrapper>
        )
      case "lead-form":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <LeadFormBlock {...block.data} />
          </BlockWrapper>
        )
      case "testimonial":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <TestimonialBlock {...block.data} />
          </BlockWrapper>
        )
      case "cta":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <CTAButtonBlock {...block.data} />
          </BlockWrapper>
        )
      case "video":
        return (
          <BlockWrapper
            id={block.id}
            isSelected={isSelected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={dragHandleProps}
          >
            <VideoBlock {...block.data} />
          </BlockWrapper>
        )
      default:
        return null
    }
  }

    return (
      <div ref={setNodeRef} style={style}>
        {renderBlockContent()}
      </div>
    )
}

export function FunnelCanvas({
  blocks,
  selectedBlockId,
  onBlocksChange,
  onSelectBlock,
  onEditBlock,
  onDeleteBlock,
  onAddBlock,
}: FunnelCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      const newBlocks = arrayMove(blocks, oldIndex, newIndex)
      onBlocksChange(newBlocks)
    }
  }

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="max-w-4xl mx-auto space-y-8">
            {blocks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">No blocks yet. Add your first block to get started.</p>
                <Button variant="outline" onClick={() => onAddBlock("headline")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Block
                </Button>
              </div>
            ) : (
              blocks.map((block) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  isSelected={block.id === selectedBlockId}
                  onSelect={() => onSelectBlock(block.id)}
                  onEdit={() => onEditBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBlock ? (
            <div className="opacity-50">
              <SortableBlockItem
                block={activeBlock}
                isSelected={false}
                onSelect={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
