import stylistic from "@stylistic/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import {fileURLToPath} from "node:url";
import js from "@eslint/js";
import {FlatCompat} from "@eslint/eslintrc";
import globals from "globals";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const compat = new FlatCompat({
    baseDirectory: _dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [{
    ignores: ["dist/**/*"],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/stylistic-type-checked",
), {
    plugins: {
        "@stylistic": stylistic,
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        globals: {
            ...globals.node,
        },

        parserOptions: {
            project: ["./tsconfig.tests.json"],
        },
    },

    rules: {
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@stylistic/object-curly-spacing": ["error", "never"],
        "comma-dangle": ["error", "always-multiline"],
        semi: ["error", "always"],
    },
}];