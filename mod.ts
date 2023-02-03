#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
// Copyright 2023 Seiri. All rights reserved. MIT license.
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";
import { exists } from "std/fs/mod.ts";

import type { SearchWord, TopSearch } from "./types.ts";
import { createArchive, createReadme, mergeWords } from "./utils.ts";

const response = await fetch("https://www.zhihu.com/api/v4/search/top_search");

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}
//search result
const result: TopSearch = await response.json();
// article data {url: url, title:title }
const words = result.top_search.words;
// date format
const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
// json path
const fullPath = join("raw", `${yyyyMMdd}.json`);
//origin data
let wordsAlreadyDownload: SearchWord[] = [];
if (await exists(fullPath)) {
  const content = await Deno.readTextFile(fullPath);
  wordsAlreadyDownload = JSON.parse(content);
}
// save origin data
const wordsAll = mergeWords(words, wordsAlreadyDownload);
await Deno.writeTextFile(fullPath, JSON.stringify(wordsAll));
// update README.md
const readme = await createReadme(wordsAll);
await Deno.writeTextFile("./README.md", readme);
// update archives
const archiveText = createArchive(wordsAll, yyyyMMdd);
const archivePath = join("archives", `${yyyyMMdd}.md`);
await Deno.writeTextFile(archivePath, archiveText);
