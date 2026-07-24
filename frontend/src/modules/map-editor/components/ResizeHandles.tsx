export function ResizeHandles() {
  return (
    <>
      <span className="rotate-handle" data-rotate-handle title="Rotacionar" />
      <span className="resize-handle resize-east" data-resize-handle="east" />
      <span className="resize-handle resize-south" data-resize-handle="south" />
      <span className="resize-handle resize-corner" data-resize-handle="corner" />
    </>
  );
}
