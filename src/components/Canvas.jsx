import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { renderElementHtmlWithPostProcessing } from '../utils/htmlRenderer';

function SortableElement({ element, isSelected, onSelect, onDelete, onDuplicate, onMoveUp, onMoveDown }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const html = renderElementHtmlWithPostProcessing(element);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all ${
        isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-1'
          : 'hover:ring-1 hover:ring-indigo-300'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {/* Toolbar */}
      <div className={`absolute -top-8 left-0 flex items-center gap-0.5 z-20 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 bg-indigo-600 text-white rounded px-2 py-1 text-xs cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={12} />
          <span className="font-medium">{element.type}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded p-1 shadow-sm"
          title="Move up"
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded p-1 shadow-sm"
          title="Move down"
        >
          <ChevronDown size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded p-1 shadow-sm"
          title="Duplicate"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded p-1 shadow-sm"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Rendered HTML */}
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="w-full pointer-events-none"
        style={{ fontFamily: 'sans-serif' }}
      />
    </div>
  );
}

export default function Canvas({ elements, selectedId, onSelect, onReorder, onDelete, onDuplicate }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = elements.findIndex(e => e.id === active.id);
      const newIndex = elements.findIndex(e => e.id === over.id);
      onReorder(arrayMove(elements, oldIndex, newIndex));
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    onReorder(arrayMove(elements, index, index - 1));
  };

  const handleMoveDown = (index) => {
    if (index === elements.length - 1) return;
    onReorder(arrayMove(elements, index, index + 1));
  };

  if (elements.length === 0) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center px-8"
        onClick={() => onSelect(null)}
      >
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <svg width="28" height="28" fill="none" stroke="#6366f1" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="font-semibold text-gray-700 text-lg mb-1">Start building your email</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Select elements from the left panel and click to add them to your email canvas
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-full py-8 px-4 flex justify-center"
      onClick={() => onSelect(null)}
    >
      <div
        className="w-full max-w-[980px] bg-white shadow-md rounded-lg overflow-hidden"
        style={{ minHeight: 100 }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={elements.map(e => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative" style={{ paddingTop: 4 }}>
              {elements.map((el, index) => (
                <SortableElement
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id}
                  onSelect={onSelect}
                  onDelete={() => onDelete(el.id)}
                  onDuplicate={() => onDuplicate(el.id)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
