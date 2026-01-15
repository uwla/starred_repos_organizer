import eslint from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"
import typescriptEslint from "typescript-eslint"

export default typescriptEslint.config(
    { ignores: ["*.d.ts", "**/coverage", "**/dist", "assets/", "public/"] },
    {
        extends: [
            eslint.configs.recommended,
            ...typescriptEslint.configs.recommended,
        ],
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
            parserOptions: { parser: typescriptEslint.parser },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn", // Allow the use of `any`
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    eslintConfigPrettier
)
