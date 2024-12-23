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
  if (match) {
    [, title] = match;

    const messages = GmailApp.search(title)
      .filter((message) => subjectRegex.exec(message.getFirstMessageSubject()))
      .sort((messageA, messageB) => {
        const [, , chapterStringA] = subjectRegex.exec(messageA.getFirstMessageSubject())!;
        const chapterA = parseInt(chapterStringA, 10);
        const [, , chapterStringB] = subjectRegex.exec(messageB.getFirstMessageSubject())!;
        const chapterB = parseInt(chapterStringB, 10);

        return chapterB - chapterA;
      });

    section = CardService.newCardSection().setHeader(
      '<font color="#1257e0"><b>Previous Chapters</b></font>',
    );

    for (const message of messages) {
      const [, , messageChapterString] = /(.*) - (.*)/.exec(message.getFirstMessageSubject())!;
      const messageLink = `https://mail.google.com/mail/u/0/#inbox/${message.getId()}`;

      const link = CardService.newDecoratedText()
        .setText(messageChapterString)
        .setOpenLink(CardService.newOpenLink().setUrl(messageLink));

      if (message.isInInbox()) {
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
