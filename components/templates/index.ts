/**
 * Template registry. Maps a PageConfig.template id to its component.
 * `bold` and `craft` are added in Phase 7.
 */
import type { ComponentType } from "react";
import type { PageConfig, TemplateId } from "@/lib/schemas";
import type { Palette } from "@/lib/presets";
import Editorial from "./Editorial";

export interface TemplateProps {
  config: PageConfig;
  palette: Palette;
  contactLink?: string;
  baseUrl: string;
}

export const TEMPLATES: Partial<
  Record<TemplateId, ComponentType<TemplateProps>>
> = {
  editorial: Editorial,
};
