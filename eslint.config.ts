// SPDX-FileCopyrightText: 2026 Martin Královič
// SPDX-FileCopyrightText: 2026 Samuel Juhaniak
// SPDX-FileCopyrightText: 2026 Tadeáš Ditte
//
// SPDX-License-Identifier: LicenseRef-SSPL-1.0

import {
   defineConfigWithVueTs,
   vueTsConfigs,
} from "@vue/eslint-config-typescript";
import skipFormatting from "eslint-config-prettier/flat";
import pluginOxlint from "eslint-plugin-oxlint";
import pluginVue from "eslint-plugin-vue";
import { globalIgnores } from "eslint/config";

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
   {
      name: "app/files-to-lint",
      files: ["**/*.{vue,ts,mts,tsx}"],
   },

   globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

   ...pluginVue.configs["flat/essential"],
   vueTsConfigs.recommended,

   ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

   skipFormatting,

   {
      name: "app/rules-override",
      rules: {
         "@typescript-eslint/no-explicit-any": "off",
      },
   }
);
