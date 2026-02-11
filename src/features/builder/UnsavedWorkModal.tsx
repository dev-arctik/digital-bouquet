// UnsavedWorkModal — shown when leaving Step 3 without saving.
// Offers save-and-leave, leave-without-saving, or cancel.

import { Modal } from '../../components/Modal';

interface UnsavedWorkModalProps {
  isOpen: boolean;
  onSaveAndLeave: () => void;
  onLeave: () => void;
  onCancel: () => void;
}

export const UnsavedWorkModal: React.FC<UnsavedWorkModalProps> = ({
  isOpen,
  onSaveAndLeave,
  onLeave,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="UNSAVED BOUQUET">
      <p className="text-xs uppercase tracking-widest text-subtitle mb-6">
        YOUR BOUQUET HASN'T BEEN SAVED. SAVE TO GARDEN BEFORE LEAVING?
      </p>

      <div className="flex flex-col gap-3">
        {/* Primary: save and leave */}
        <button
          onClick={onSaveAndLeave}
          className="w-full bg-rose text-white text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-lg hover:bg-rose-dark hover:scale-[1.02] hover:shadow-md transition-all duration-200"
        >
          SAVE & LEAVE
        </button>

        {/* Secondary: leave without saving */}
        <button
          onClick={onLeave}
          className="w-full border-2 border-rose text-rose text-xs uppercase tracking-widest font-bold py-3 px-6 rounded-lg hover:bg-rose-light transition-all duration-200"
        >
          LEAVE WITHOUT SAVING
        </button>

        {/* Tertiary: cancel (underlined text) */}
        <button
          onClick={onCancel}
          className="w-full text-xs uppercase tracking-widest font-bold py-2 text-rose-dark underline hover:text-rose transition-colors"
        >
          CANCEL
        </button>
      </div>
    </Modal>
  );
};
