import { connectors } from '../../lib/connectors';
import { Status } from '../../lib/interfaces/manga';
import { putUserManga } from '../lib/db';
import { getParameters } from '../lib/utils';

function showManga(event: any) {
  const { connector, manga, readChapters } = getParameters(event);

  const lastChapter = manga.chapters[manga.chapters.length - 1];
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
        CardService.newAction()
          .setFunctionName('showChapter')
          .setParameters({
            connector,
            manga: JSON.stringify(manga),
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
                  CardService.newAction()
                    .setFunctionName('showChapter')
                    .setParameters({
                      connector,
                      manga: JSON.stringify(manga),
                      chapter: nextUnreadChapter.index.toString(),
                    }),
                )
            : CardService.newDecoratedText().setText('No more chapters to read.'),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark as Read')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('markMangaAsRead')
                .setParameters({
                  connector,
                  manga: JSON.stringify(manga),
                }),
            ),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark as Completed')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('markMangaAsCompleted')
                .setParameters({
                  connector,
                  manga: JSON.stringify(manga),
                  readChapters: JSON.stringify(readChapters),
                }),
            ),
        ),
    )
    .addSection(chapters);

  return card.build();
}

function showChapter(event: any) {
  const { connector, manga } = getParameters(event);
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
        CardService.newAction()
          .setFunctionName('createEmailChapter')
          .setParameters({
            connector,
            manga: JSON.stringify(manga),
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
              CardService.newAction()
                .setFunctionName('markChapterAsRead')
                .setParameters({
                  connector,
                  manga: JSON.stringify(manga),
                  chapter: chapter.index.toString(),
                }),
            ),
        ),
    )
    .addSection(messagesSection);

  return card.build();
}

function createEmailChapter(event: any) {
  const { connector, manga, chapterIndex } = getParameters(event);

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
  const { connector: connectorName, manga } = getParameters(event);
  const connector = connectors.find((connector) => connector.name === connectorName)!;

  putUserManga({
    connector: connectorName,
    needsLazyLoading: connector.needsLazyLoading,
    manga,
    readChapters: manga.chapters.map((chapter) => chapter.index),
  });

  return CardService.newNavigation().updateCard(showManga(event));
}

function markMangaAsCompleted(event: any) {
  const { connector: connectorName, manga, readChapters } = getParameters(event);
  const connector = connectors.find((connector) => connector.name === connectorName)!;

  manga.status = Status.Completed;

  putUserManga({
    connector: connectorName,
    needsLazyLoading: connector.needsLazyLoading,
    manga,
    readChapters,
  });

  return CardService.newNavigation().updateCard(showManga(event));
}
