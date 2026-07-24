import { useCallback, useState } from 'react';
import type { MapEditorState } from '../map-editor.types';

function snapshot(state: MapEditorState): MapEditorState {
  return structuredClone(state);
}

export function useEditorHistory(initialState: MapEditorState) {
  const [state, setState] = useState(initialState);
  const [past, setPast] = useState<MapEditorState[]>([]);
  const [future, setFuture] = useState<MapEditorState[]>([]);

  const commit = useCallback((nextState: MapEditorState, previousState = state) => {
    setPast((items) => [...items, snapshot(previousState)]);
    setFuture([]);
    setState(snapshot({ ...nextState, isDirty: true }));
  }, [state]);

  const replace = useCallback((nextState: MapEditorState) => {
    setState(snapshot(nextState));
  }, []);

  const undo = useCallback(() => {
    setPast((items) => {
      const previous = items.at(-1);

      if (!previous) {
        return items;
      }

      setFuture((futureItems) => [snapshot(state), ...futureItems]);
      setState(snapshot(previous));

      return items.slice(0, -1);
    });
  }, [state]);

  const redo = useCallback(() => {
    setFuture((items) => {
      const next = items[0];

      if (!next) {
        return items;
      }

      setPast((pastItems) => [...pastItems, snapshot(state)]);
      setState(snapshot(next));

      return items.slice(1);
    });
  }, [state]);

  return {
    state,
    setState: replace,
    commit,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}
