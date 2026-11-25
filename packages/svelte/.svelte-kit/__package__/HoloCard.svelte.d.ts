import { type HoloCardOptions } from "@glimmerui/core";
import type { EffectProps } from "./types.js";
declare const HoloCard: import("svelte").Component<EffectProps<HoloCardOptions & {
    alt: string;
}>, {}, "ref">;
type HoloCard = ReturnType<typeof HoloCard>;
export default HoloCard;
