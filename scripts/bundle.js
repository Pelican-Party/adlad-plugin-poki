/**
 * @fileoverview Bundles the plugin into a single file so that it can be published to package managers.
 */

import { rollup } from "npm:rollup@3.17.3";
import { minify } from "npm:terser@5.15.0";
import * as path from "$std/path/mod.ts";
import { setCwd } from "$chdir_anywhere";
setCwd();

/**
 * A rollup plugin for minifying builds.
 * @param {import("npm:terser@5.15.0").MinifyOptions} minifyOptions
 * @returns {import("npm:rollup@3.17.3").Plugin}
 */
export function terser(minifyOptions = {}) {
	return {
		name: "terser",
		async renderChunk(code) {
			const output = await minify(code, minifyOptions);
			if (!output.code) return null;
			return {
				code: output.code,
			};
		},
	};
}

const bundle = await rollup({
	input: "../mod.js",
	plugins: [terser({
		format: {
			keep_quoted_props: true,
		},
	})],
});

await bundle.write({
	file: "../dist/adlad-plugin-poki.js",
	format: "esm",
});

const tmpDir = await Deno.makeTempDir();

Deno.chdir("..");
const command = new Deno.Command(Deno.execPath(), {
	args: [
		"run",
		"--allow-env",
		"--allow-read",
		"--allow-write",
		"npm:typescript@4.9.5/tsc",
		"-p",
		"./generateTypes.tsconfig.json",
		"--outDir",
		tmpDir,
	],

	// tsc emits a whooole bunch of type errors that we are just going to ignore
	// because deno test already does type checking for us
	stderr: "null",
	stdout: "null",
});
await command.output();

await Deno.copyFile(path.resolve(tmpDir, "src/mod.d.ts"), path.resolve("dist/adlad-plugin-poki.d.ts"));

await Deno.remove(tmpDir, {
	recursive: true,
});
