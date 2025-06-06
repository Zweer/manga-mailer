import { NextResponse } from 'next/server';

import { createChildLogger } from '@/lib/log';
import { mangaUpdater } from '@/lib/service/mangaUpdater';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      CRON_SECRET: string;
    }
  }
}

const logger = createChildLogger('api:cron:manga-updates');

export async function GET(request: Request) {
  logger.info('Manga update cron job triggered.');

  const CRON_SECRET = process.env.CRON_SECRET;
  const authorizationHeader = request.headers.get('authorization');
  if (CRON_SECRET && authorizationHeader !== `Bearer ${CRON_SECRET}`) {
    logger.warn('Unauthorized attempt to trigger cron job.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('Starting mangaUpdater service...');
    const details = await mangaUpdater();
    logger.info({
      emailsSent: details.emailsSent,
      updatedMangasCount: details.updatedMangas.length,
      errorsCount: details.errors.length,
    }, 'Manga updater service finished.');

    return NextResponse.json({
      message: 'Manga update process finished.',
      details,
    });
  } catch (error) {
    logger.error({ error }, 'Critical error in manga update cron job API handler.');
    return NextResponse.json({ error: 'Failed to run manga update process', details: (error as Error).message }, { status: 500 });
  }
}
