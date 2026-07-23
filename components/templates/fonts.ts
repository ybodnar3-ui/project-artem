/**
 * Static next/font imports for every editorial preset font.
 * next/font requires literal, top-level instantiation — you cannot pick a
 * family dynamically at runtime — so all preset fonts are declared here and
 * mapped by font_pair_id.
 */
import {
  Fraunces,
  Newsreader,
  Playfair_Display,
  Source_Serif_4,
  Libre_Baskerville,
  Work_Sans,
} from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"], // not a variable font — weights required
  variable: "--font-libre",
  display: "swap",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export interface FontPairVars {
  /** className that defines both --font-* CSS variables on a subtree */
  className: string;
  displayVar: string;
  bodyVar: string;
}

export const FONT_PAIRS: Record<string, FontPairVars> = {
  "ed-fraunces-newsreader": {
    className: `${fraunces.variable} ${newsreader.variable}`,
    displayVar: "--font-fraunces",
    bodyVar: "--font-newsreader",
  },
  "ed-playfair-source": {
    className: `${playfair.variable} ${sourceSerif.variable}`,
    displayVar: "--font-playfair",
    bodyVar: "--font-source-serif",
  },
  "ed-libre-work": {
    className: `${libreBaskerville.variable} ${workSans.variable}`,
    displayVar: "--font-libre",
    bodyVar: "--font-work-sans",
  },
};

/** Fallback to the first editorial pair if an unknown id slips through. */
export function resolveFontPairVars(id: string): FontPairVars {
  return FONT_PAIRS[id] ?? FONT_PAIRS["ed-fraunces-newsreader"];
}
