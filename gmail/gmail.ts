const subjectRegex = /(.*) - (.*)/;
const mangaMailerSender = 'MangaMailer <mailtrap@demomailtrap.com>';

interface Event {
  messageMetadata: {
    accessToken: string;
    messageId: string;
  };
}

export function mangaChapters(event: Event) {
  const { accessToken, messageId } = event.messageMetadata;

  GmailApp.setCurrentMessageAccessToken(accessToken);

  let title: string;
  let section;

  const message = GmailApp.getMessageById(messageId);

  const sender = message.getFrom();
  console.log('sender:', sender);
  if (sender !== mangaMailerSender) {
    const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('Wrong message'))
      .addSection(
        CardService.newCardSection().addWidget(
          CardService.newDecoratedText().setText('This message is from Manga Mailer'),
        ),
      )
      .build();

    return [card];
  }

  const subject = message.getSubject();
  const match = subjectRegex.exec(subject);
  console.log('match:', match);
  if (match) {
    [, title] = match;
    const [, , chapterString] = match;
    const chapter = parseInt(chapterString, 10);
    const mangaTitleRegex = new RegExp(`${title.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')} - (.*)`);

    console.log('title:', title);
    console.log('chapter:', chapter);

    const strippedTitle = title.replace(/\?/g, '').trim();
    console.log('strippedTitle:', strippedTitle);

    const foundMessages = GmailApp.search(strippedTitle, 0, chapter);
    console.log('foundMessages:', foundMessages.length);

    const messages = foundMessages
      .map((message) => ({
        id: message.getId(),
        isInInbox: message.isInInbox(),
        subject: message.getFirstMessageSubject(),
      }))
      .filter(({ subject }) => mangaTitleRegex.exec(subject))
      .map(({ subject, id, isInInbox }) => ({
        chapter: parseInt(mangaTitleRegex.exec(subject)![1], 10),
        id,
        isInInbox,
        subject,
      }))
      .sort(({ chapter: chapterA }, { chapter: chapterB }) => chapterB - chapterA);
    console.log('messages:', messages.length);

    section = CardService.newCardSection().setHeader(
      '<font color="#1257e0"><b>Previous Chapters</b></font>',
    );

    for (const message of messages) {
      const link = CardService.newDecoratedText()
        .setText(message.chapter.toString())
        .setOpenLink(
          CardService.newOpenLink().setUrl(`https://mail.google.com/mail/u/0/#inbox/${message.id}`),
        );

      if (message.isInInbox) {
        link.setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL));
      }

      section.addWidget(link);
    }
  } else {
    title = 'Something bad happened';
    section = CardService.newCardSection().addWidget(
      CardService.newDecoratedText().setText(`Error while processing chapter "${subject}"`),
    );
  }

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(title))
    .addSection(section)
    .build();

  return [card];
}
