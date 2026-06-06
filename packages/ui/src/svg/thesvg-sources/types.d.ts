import type { TheSvgIconModule } from "../thesvg-icon";

export type TheSvgIconBundle = TheSvgIconModule & {
  slug: string;
  hex: string;
  categories: string[];
  aliases: string[];
  variants: Record<string, string>;
  license: string;
  url: string;
};
