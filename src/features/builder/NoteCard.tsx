// NoteCard — draggable note card rendered on the bouquet canvas.
// Uses @dnd-kit for drag-and-drop positioning.

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Note } from '../../types';
import { getNoteWidth } from '../../data/flowers';

interface NoteCardProps {
  note: Note;
  zIndex: number;
}

const DRAG_ID = 'note-card';

export const NoteCard: React.FC<NoteCardProps> = ({ note, zIndex }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: DRAG_ID,
  });

  // Combine base position with drag offset during active drag.
  // Slight rotation gives the card a hand-placed, organic feel.
  const baseRotate = 'rotate(-1.5deg)';
  const dragTranslate = transform ? CSS.Translate.toString(transform) : '';
  const style: React.CSSProperties = {
    position: 'absolute',
    left: note.x,
    top: note.y,
    width: getNoteWidth(note.text),
    zIndex,
    transform: dragTranslate ? `${dragTranslate} ${baseRotate}` : baseRotate,
    // Prevent browser from hijacking touch gestures (scroll/zoom) on draggable elements
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#FFF8F0] border-2 border-[#E8C4B8] rounded-xl shadow-lg p-4 cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      {/* Note text — italic DM Sans in warm brown ink for a handwritten feel */}
      <p className="font-note text-base leading-relaxed break-words whitespace-pre-wrap m-0 text-[#5C4033] italic text-justify">
        {note.text}
      </p>
    </div>
  );
};
