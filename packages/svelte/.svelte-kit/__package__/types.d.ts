import type { HTMLAttributes } from "svelte/elements";
/** An effect's options, plus anything its root element takes. */
export type EffectProps<O, A = HTMLAttributes<HTMLDivElement>> = O & Omit<A, keyof O | "style"> & {
    style?: string;
    /** The root element. Bind it with bind:ref. */
    ref?: HTMLElement | null;
};
