import { MouseEvent } from "react";
type Props = { label?: string; onConfirm: () => Promise<void> | void; };
export default function ConfirmDeleteButton({ label = "Delete", onConfirm }: Props) {
  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => { e.preventDefault(); if (!window.confirm("Are you sure you want to delete this item?")) return; await onConfirm(); };
  return <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={handleClick}>{label}</button>;
}
