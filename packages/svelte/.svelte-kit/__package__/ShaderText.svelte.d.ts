import { type ShaderTextOptions } from "@glimmerui/core";
import type { HTMLAttributes } from "svelte/elements";
import type { EffectProps } from "./types.js";
declare const ShaderText: import("svelte").Component<EffectProps<ShaderTextOptions, Omit<HTMLAttributes<HTMLSpanElement>, "children">>, {}, "ref">;
type ShaderText = ReturnType<typeof ShaderText>;
export default ShaderText;
