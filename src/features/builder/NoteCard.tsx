// NoteCard — draggable note card rendered on the bouquet canvas.
// Uses @dnd-kit for drag-and-drop positioning.

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Note } from '../../types';
import { NOTE_WIDTH } from '../../data/flowers';

interface NoteCardProps {
  note: Note;
  zIndex: number;
}

const DRAG_ID = 'note-card';

export const NoteCard: React.FC<NoteCardProps> = ({ note, zIndex }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: DRAG_ID,
  });

  // Combine base position with drag offset during active drag
  const style: React.CSSProperties = {
    position: 'absolute',
    left: note.x,
    top: note.y,
    width: NOTE_WIDTH,
    zIndex,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-rose rounded-xl shadow-md p-3 cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      {/* Note text in DM Sans — normal case, not uppercase */}
      <p className="font-note text-sm leading-relaxed break-words whitespace-pre-wrap m-0">
        {note.text}
      </p>
    </div>
  );
};
