"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const connectors_1 = require("../lib/connectors");
const utils_1 = require("./utils");
function validateSource(comicSource) {
    return Object.keys(connectors_1.connectors).includes(comicSource);
}
async function main() {
    const comicId = (0, core_1.getInput)('comic_id', { required: true });
    const comicSource = (0, core_1.getInput)('comic_source', { required: true });
    const comicChapter = parseInt((0, core_1.getInput)('comic_chapter'), 10);
    const readMangas = (0, utils_1.getReadMangas)();
    if (!validateSource(comicSource)) {
        throw new Error(`Invalid comic source provided: ${comicSource}`);
    }
    const connector = connectors_1.connectors[comicSource];
    const manga = await connector.getManga(comicId);
    if (readMangas.mangas.some((manga) => manga.id === comicId && manga.site === comicSource)) {
        throw new Error('Comic is alread tracked');
    }
    readMangas.mangas.push({
        site: comicSource,
        id: comicId,
        title: manga.title,
        lastReadChapter: comicChapter,
    });
    (0, core_1.setOutput)('comic_name', manga.title);
    readMangas.mangas.sort((mangaA, mangaB) => {
        if (mangaA.site !== mangaB.site) {
            return mangaA.site.localeCompare(mangaB.site);
        }
        if (mangaA.site === 'mangapark') {
            return parseInt(mangaA.id, 10) - parseInt(mangaB.id, 10);
        }
        return mangaA.id.localeCompare(mangaB.id);
    });
    (0, utils_1.putReadMangas)(readMangas);
}
main().catch((error) => {
    (0, core_1.setFailed)(`Action failed with error ${error}`);
});
