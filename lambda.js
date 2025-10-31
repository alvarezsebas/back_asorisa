import serverless from '@vendia/serverless-express';
import app from './app.js';

export const handler = serverless({ app });
