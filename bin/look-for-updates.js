"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectors_1 = require("../lib/connectors");
const notifier_1 = require("../lib/notifier");
const utils_1 = require("./utils");
const dry = process.argv.some((arg) => arg === '--dry');
async function checkManga(readManga) {
    if (readManga.disabled) {
        return 0;
    }
    const connector = connectors_1.connectors[readManga.site];
    const manga = await connector.getManga(readManga.id);
    const newChapters = manga.chapters
        .filter((chapter) => chapter.index > readManga.lastReadChapter)
        .sort((chapterA, chapterB) => chapterA.index - chapterB.index);
    if (newChapters.length > 0) {
        await notifyUser(manga, newChapters);
        // eslint-disable-next-line require-atomic-updates
        readManga.lastReadChapter = newChapters[newChapters.length - 1].index;
    }
    return newChapters.length;
}
async function notifyUser(manga, newChapters) {
    console.log('Unread chapters found!', manga.title, newChapters.map((chapter) => chapter.index));
    await newChapters.reduce(async (promise, newChapter) => {
        await promise;
        await notifyChapter(manga, newChapter);
    }, Promise.resolve());
}
async function notifyChapter(manga, chapter) {
    let subject = `${manga.title} - ${chapter.index}`;
    if (chapter.title) {
        subject = `${subject} - ${chapter.title}`;
    }
    const text = chapter.url;
    const htmlChapter = chapter.images.map((image) => `<img src="${image}" />`).join('<br />\n');
    const html = `${htmlChapter}<br /><br />\n${subject}`;
    if (!dry) {
        const notification = await (0, notifier_1.notify)(subject, text, html);
        console.log(`${notification.sent ? 'OK' : 'KO'} - ${manga.title} - ${chapter.index}`);
    }
}
async function main() {
    if (dry) {
        console.log('!!! Dry run !!!');
    }
    const readMangas = (0, utils_1.getReadMangas)();
    const unread = await readMangas.mangas.reduce(async (promise, readManga) => {
        const sum = await promise;
        const unread = await checkManga(readManga);
        return sum + unread;
    }, Promise.resolve(0));
    console.log('Unread manga chapters found:', unread);
    if (!dry) {
        (0, utils_1.putReadMangas)(readMangas);
    }
}
main().catch((error) => console.error(error));
