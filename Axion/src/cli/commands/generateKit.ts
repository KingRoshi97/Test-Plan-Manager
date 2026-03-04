import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { packageKit, type KitVariant } from "../../core/kit/packager.js";

export function cmdGenerateKit(inputPath: string, outputDir?: string, variant?: string): void {
  const runDir = resolve(inputPath);
  if (!existsSync(runDir)) {
    console.error(`Run directory not found: ${runDir}`);
    process.exit(1);
  }

  const kitVariant: KitVariant = variant === "external" ? "external" : "internal";
  const output = outputDir ? resolve(outputDir) : join(runDir, "kit", "output");

  try {
    packageKit(runDir, output, kitVariant);
    console.log(`Kit generated successfully: ${output}`);
    console.log(`  Variant: ${kitVariant}`);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Kit generation failed: ${err.message}`);
    }
    process.exit(1);
  }
}
