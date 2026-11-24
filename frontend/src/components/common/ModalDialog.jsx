import { useEffect, useRef } from 'react';

/**
 * Native <dialog> modal primitive following modern-web-guidance (`dialog`):
 * - Uses showModal() for built-in inert background, focus trap, Esc dismissal, and focus return.
 * - Never adds redundant role="dialog" or aria-modal.
 * - Supports pointer-outside light dismiss safely (requires both pointerdown & pointerup outside).
 */
export function ModalDialog({
  isOpen = true,
  labelledBy,
  variant = 'center',
  maxWidthClass = 'max-w-lg',
  onClose,
  children,
}) {
  const dialogRef = useRef(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen && !el.open) {
      el.showModal();
    } else if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isOutside = (e) => {
    const el = dialogRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose?.();
  };

  const handlePointerDown = (e) => {
    pressedOutsideRef.current = isOutside(e);
  };

  const handlePointerUp = (e) => {
    if (pressedOutsideRef.current && isOutside(e)) {
      onClose?.();
    }
    pressedOutsideRef.current = false;
  };

  const dialogClass =
    variant === 'drawer'
      ? `m-0 ml-auto h-dvh w-full ${maxWidthClass} border-l border-[var(--border-strong)] bg-[var(--surface-card)] p-0 text-[var(--ink-primary)]`
      : `m-auto w-[calc(100%-2rem)] ${maxWidthClass} rounded-lg border border-[var(--border-strong)] bg-[var(--surface-card)] p-0 text-[var(--ink-primary)]`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={dialogClass}
    >
      {children}
    </dialog>
  );
}
