// NoteModal — modal for writing or editing the bouquet note.
// Pre-fills from Redux state when editing an existing note.
// Dispatches setNote on save, clears it on delete or empty text.

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setNote } from './builderSlice';
import { Modal } from '../../components/Modal';
import { MAX_NOTE_WORDS, DEFAULT_NOTE_POSITION, ALLOWED_FONTS } from '../../data/flowers';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Count words by splitting on whitespace and filtering empty strings
const countWords = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const existingNote = useAppSelector((state) => state.builder.note);

  const [text, setText] = useState('');
  const [fontFamily] = useState<string>(ALLOWED_FONTS[0]);

  const isEditing = existingNote !== null;
  const wordCount = countWords(text);

  // Sync local state from Redux when modal opens
  useEffect(() => {
    if (isOpen) {
      setText(existingNote?.text ?? '');
    }
  }, [isOpen, existingNote]);

  // Prevent adding words beyond the limit while allowing edits
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newWordCount = countWords(newText);

    // Allow the change if we're at or below the limit
    if (newWordCount <= MAX_NOTE_WORDS) {
      setText(newText);
      return;
    }

    // Over limit: only allow if user is editing (not adding new words).
    // We permit deletion or same-word-count edits but block new words.
    if (newWordCount <= wordCount) {
      setText(newText);
    }
  };

  const handleDone = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      // Empty text = no note
      dispatch(setNote(null));
    } else {
      dispatch(
        setNote({
          text: trimmed,
          fontFamily,
          // Preserve existing position when editing, otherwise use default
          x: existingNote?.x ?? DEFAULT_NOTE_POSITION.x,
          y: existingNote?.y ?? DEFAULT_NOTE_POSITION.y,
        })
      );
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = () => {
    dispatch(setNote(null));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'EDIT NOTE' : 'ADD A NOTE'}>
      <div className="flex flex-col gap-4">
        {/* Textarea previews the note in DM Sans */}
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Write a short message..."
          rows={5}
          className="w-full border border-rose-light rounded-lg p-3 font-note text-base resize-none bg-white focus:ring-rose focus:border-rose focus:outline-none"
        />

        {/* Word count + font label */}
        <div className="flex items-center justify-between font-note text-xs">
          <span className={wordCount >= MAX_NOTE_WORDS ? 'text-coral font-semibold' : 'text-subtitle'}>
            {wordCount} / {MAX_NOTE_WORDS} words
          </span>
          <span className="text-subtitle">
            Font: {fontFamily}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleDone}
            className="bg-rose text-white px-5 py-2 rounded-lg hover:bg-rose-dark hover:scale-[1.02] hover:shadow-md font-note text-sm font-semibold transition-all duration-200"
          >
            Done
          </button>
          <button
            onClick={handleCancel}
            className="border-2 border-rose text-rose px-5 py-2 rounded-lg hover:bg-rose-light font-note text-sm font-semibold transition-all duration-200"
          >
            Cancel
          </button>

          {/* Delete button only appears when editing an existing note */}
          {isEditing && (
            <button
              onClick={handleDelete}
              className="ml-auto text-coral underline font-note text-sm hover:text-[#E85A35] transition-all duration-200"
            >
              Delete Note
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
