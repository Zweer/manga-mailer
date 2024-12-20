const subjectRegex = /(.*) - (.*)/;

function mangaChapters(event) {
  const { accessToken, messageId } = event.messageMetadata;

  GmailApp.setCurrentMessageAccessToken(accessToken);

  const message = GmailApp.getMessageById(messageId);
  const subject = message.getSubject();
  const [, title] = subjectRegex.exec(subject);

  const messages = GmailApp.search(title).sort((messageA, messageB) => {
    const [, , chapterStringA] = subjectRegex.exec(messageA.getFirstMessageSubject());
    const chapterA = parseInt(chapterStringA, 10);
    const [, , chapterStringB] = subjectRegex.exec(messageB.getFirstMessageSubject());
    const chapterB = parseInt(chapterStringB, 10);

    return chapterB - chapterA;
  });

  const section = CardService.newCardSection().setHeader(
    '<font color="#1257e0"><b>Previous Chapters</b></font>',
  );

  for (const message of messages) {
    const [, , messageChapterString] = /(.*) - (.*)/.exec(message.getFirstMessageSubject());
    const messageLink = `https://mail.google.com/mail/u/0/#inbox/${message.getId()}`;

    Logger.log(`chapter ${messageChapterString} isInInbox ${message.isInInbox()}`);

    const link = CardService.newDecoratedText()
      .setText(messageChapterString)
      .setOpenLink(CardService.newOpenLink().setUrl(messageLink));

    if (message.isInInbox()) {
      link.setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL));
    }

    section.addWidget(link);
  }

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(title))
    .addSection(section)
    .build();

  return [card];
}
