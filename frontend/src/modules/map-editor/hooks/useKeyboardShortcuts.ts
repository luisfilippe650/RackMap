import { useEffect } from 'react';

type KeyboardShortcutOptions = {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
};

export function useKeyboardShortcuts({ onUndo, onRedo, onDelete }: KeyboardShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTextInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';

      if ((event.key === 'Delete' || event.key === 'Backspace') && !isTextInput) {
        event.preventDefault();
        onDelete();
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();

        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDelete, onRedo, onUndo]);
}
