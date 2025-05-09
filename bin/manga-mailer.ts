#!/usr/bin/env node
import { App } from 'aws-cdk-lib';

import { MangaMailerStack } from '../lib/manga-mailer-stack';

const app = new App();
new MangaMailerStack(app, 'MangaMailerStack');
