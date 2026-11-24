import { useId } from "react";

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(value: number): void;
}

/** A labelled slider that shows its current value. */
export function Range({ label, value, min, max, step, onChange }: RangeProps) {
  const id = useId();
  return (
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output htmlFor={id}>{value}</output>
    </label>
  );
}
