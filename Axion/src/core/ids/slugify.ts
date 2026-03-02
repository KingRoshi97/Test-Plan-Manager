import { NotImplementedError } from "../../utils/errors.js";

export interface SlugOptions {
  maxLength?: number;
  collisionSuffix?: boolean;
}

export function slugify(_name: string, _options?: SlugOptions): string {
  throw new NotImplementedError("slugify");
}

export function slugifyWithCollisionHandling(
  _name: string,
  _existingSlugs: Set<string>,
  _options?: SlugOptions
): string {
  throw new NotImplementedError("slugifyWithCollisionHandling");
}
