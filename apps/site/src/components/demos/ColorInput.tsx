import { useId } from "react";

interface ColorInputProps {
  label: string;
  value: string;
  onChange(value: string): void;
}

/** A labelled color picker. */
export function ColorInput({ label, value, onChange }: ColorInputProps) {
  const id = useId();
  return (
    <label htmlFor={id}>
      {label}
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
