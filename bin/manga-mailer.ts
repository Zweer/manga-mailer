#!/usr/bin/env node
import { App } from 'aws-cdk-lib';

import { MangaMailerStack } from '../lib/stack/manga-mailer.js';

const app = new App();
new MangaMailerStack(app, 'MangaMailerStack');
