import { getUserManga, MangaSaveComplete, putUserManga } from '../lib/db';
import { Status } from '../../lib/interfaces/manga';
import { getParameters } from '../lib/utils';

function showManga(event: any) {
  const { connector, mangaId } = getParameters(event);
  const { manga, lastChapter, readChapters } = getUserManga(
    connector,
    mangaId,
  ) as MangaSaveComplete;

  let lastChapterWidget = CardService.newDecoratedText().setText(`Last Chapter: ${lastChapter.id}`);
  if (lastChapter.releasedAt) {
    lastChapterWidget = lastChapterWidget.setBottomLabel(
      new Date(lastChapter.releasedAt).toDateString(),
    );
  }

  const nextUnreadChapter = manga.chapters.find((chapter) => !readChapters.includes(chapter.index));

  const chapters = CardService.newCardSection().setHeader('Chapters');
  const selectionInput = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName('chapterDropdown')
    .setTitle('Select Chapter');
  manga.chapters.forEach((chapter) => {
    selectionInput.addItem(`Chapter ${chapter.index}`, chapter.index.toString(), false);
  });
  chapters.addWidget(selectionInput).addWidget(
    CardService.newTextButton()
      .setText('Select')
      .setOnClickAction(
        CardService.newAction().setFunctionName('showChapter').setParameters({
          connector,
          mangaId: manga.id,
        }),
      ),
  );

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(manga.title))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newDecoratedText().setText('Status:').setBottomLabel(manga.status))
        .addWidget(lastChapterWidget)
        .addWidget(
          nextUnreadChapter
            ? CardService.newDecoratedText()
                .setText(`Next unread: chapter ${nextUnreadChapter.index}`)
                .setOnClickAction(
                  CardService.newAction().setFunctionName('showChapter').setParameters({
                    connector,
                    mangaId: manga.id,
                    chapter: nextUnreadChapter.index.toString(),
                  }),
                )
            : CardService.newDecoratedText().setText('No more chapters to read.'),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark Manga as Read')
            .setOnClickAction(
              CardService.newAction().setFunctionName('markMangaAsRead').setParameters({
                connector,
                mangaId: manga.id,
              }),
            ),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark Manga as Completed')
            .setOnClickAction(
              CardService.newAction().setFunctionName('markMangaAsCompleted').setParameters({
                connector,
                mangaId: manga.id,
              }),
            ),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Delete Manga')
            .setOnClickAction(
              // function on homepage
              CardService.newAction().setFunctionName('deleteManga').setParameters({
                connector,
                mangaId: manga.id,
              }),
            )
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED),
        ),
    )
    .addSection(chapters)
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton()
          .setText('Back to Home')
          .setOnClickAction(CardService.newAction().setFunctionName('mangaHomepage')),
      ),
    );

  return card.build();
}

function showChapter(event: any) {
  const { connector, mangaId } = getParameters(event);
  const { manga } = getUserManga(connector, mangaId) as MangaSaveComplete;
  let { chapterIndex } = getParameters(event);
  if (!chapterIndex) {
    chapterIndex = parseInt(event.formInput.chapterDropdown, 10);
    console.log('chapterIndex:', chapterIndex);
  }

  const chapter = manga.chapters.find((chapter) => chapter.index === chapterIndex)!;
  console.log('chapter:', chapter);

  const messagesSection = CardService.newCardSection().setHeader('Chapter');
  GmailApp.setCurrentMessageAccessToken(event.messageMetadata.accessToken);
  const messages = GmailApp.search(`"${connector} ${manga.id} ${chapter.index}"`, 0, 1);
  if (messages.length > 0) {
    messages.forEach((message) => {
      const link = CardService.newDecoratedText()
        .setText(message.getFirstMessageSubject())
        .setBottomLabel(message.getLastMessageDate().toDateString())
        .setOpenLink(
          CardService.newOpenLink().setUrl(
            `https://mail.google.com/mail/u/0/#inbox/${message.getId()}`,
          ),
        )
        .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL));
      messagesSection.addWidget(link);
    });
  } else {
    messagesSection.addWidget(
      CardService.newDecoratedText().setText('No message found for this chapter.'),
    );
  }
  messagesSection.addWidget(
    CardService.newTextButton()
      .setText('Create email for chapter.')
      .setOnClickAction(
        CardService.newAction().setFunctionName('createEmailChapter').setParameters({
          connector,
          mangaId: manga.id,
          chapter: chapter.index.toString(),
        }),
      ),
  );

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(`${manga.title} - ${chapter.index}`))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newDecoratedText()
            .setText('Open external')
            .setOpenLink(CardService.newOpenLink().setUrl(chapter.url))
            .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.BOOKMARK)),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark as Read')
            .setOnClickAction(
              CardService.newAction().setFunctionName('markChapterAsRead').setParameters({
                connector,
                mangaId: manga.id,
                chapter: chapter.index.toString(),
              }),
            ),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark as Read (up to this)')
            .setOnClickAction(
              CardService.newAction().setFunctionName('markChaptersAsRead').setParameters({
                connector,
                mangaId: manga.id,
                chapter: chapter.index.toString(),
              }),
            ),
        ),
    )
    .addSection(messagesSection)
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton()
          .setText('Back to Home')
          .setOnClickAction(CardService.newAction().setFunctionName('mangaHomepage')),
      ),
    );

  return card.build();
}

function createEmailChapter(event: any) {
  const { connector, mangaId, chapterIndex } = getParameters(event);
  const { manga } = getUserManga(connector, mangaId) as MangaSaveComplete;

  const chapter = manga.chapters.find((chapter) => chapter.index === chapterIndex)!;
  console.log('chapter:', chapter);

  const htmlImages = chapter.images.map((image) => `<img src="${image}" />`).join('<br />\n');
  const htmlMetadata = `[${connector}] [${manga.id}] ${manga.title} - ${chapterIndex}`;

  GmailApp.setCurrentMessageAccessToken(event.messageMetadata.accessToken);
  GmailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    `${manga.title} - ${chapterIndex}`,
    htmlMetadata,
    {
      htmlBody: [htmlImages, htmlMetadata].join('<br /><br />\n'),
      name: 'MangaMailer',
    },
  );

  return CardService.newNavigation().updateCard(showChapter(event));
}

function markMangaAsRead(event: any) {
  const { connector, mangaId } = getParameters(event);
  const { manga, needsLazyLoading } = getUserManga(connector, mangaId) as MangaSaveComplete;

  putUserManga({
    connector,
    manga,
    readChapters: manga.chapters.map((chapter) => chapter.index),
    needsLazyLoading,
  });

  return CardService.newNavigation().updateCard(showManga(event));
}

function markMangaAsCompleted(event: any) {
  const { connector, mangaId } = getParameters(event);
  const { manga, readChapters, needsLazyLoading } = getUserManga(
    connector,
    mangaId,
  ) as MangaSaveComplete;

  manga.status = Status.Completed;

  putUserManga({
    connector,
    manga,
    readChapters,
    needsLazyLoading,
  });

  return CardService.newNavigation().updateCard(showManga(event));
}

function markChapterAsRead(event: any) {
  const { connector, mangaId, chapterIndex } = getParameters(event);
  const { manga, readChapters, needsLazyLoading } = getUserManga(
    connector,
    mangaId,
  ) as MangaSaveComplete;

  readChapters.push(chapterIndex);
  readChapters.sort((chapterA, chapterB) => chapterA - chapterB);

  putUserManga({
    connector,
    manga,
    readChapters,
    needsLazyLoading,
  });

  return CardService.newNavigation().updateCard(showManga(event));
}

function markChaptersAsRead(event: any) {
  const { connector, mangaId, chapterIndex } = getParameters(event);
  const { manga, needsLazyLoading } = getUserManga(connector, mangaId) as MangaSaveComplete;

  putUserManga({
    connector,
    manga,
    readChapters: manga.chapters
      .filter((chapter) => chapter.index <= chapterIndex)
      .map((chapter) => chapter.index),
    needsLazyLoading,
  });

  return CardService.newNavigation().updateCard(showManga(event));
}
