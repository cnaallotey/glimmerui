import { useState } from "react";
import { CursorTrail } from "@glimmerui/react";

/** Turns the page-wide cursor trail on and off. It starts off. */
export function TrailToggle() {
  const [on, setOn] = useState(false);
  return (
    <>
      <button type="button" className="mk-btn" aria-pressed={on} onClick={() => setOn(!on)}>
        {on ? "Turn the trail off" : "Turn the trail on"}
      </button>
      {on && <CursorTrail />}
    </>
  );
}
