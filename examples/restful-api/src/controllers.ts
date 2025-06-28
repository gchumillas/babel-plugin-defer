import { Request, Response } from 'express';
import { defer } from 'babel-plugin-defer/runtime';

export function getStatus(req: Request, res: Response) {
  defer(() => console.log('Status request processed at:', new Date()));
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

export function getHello(req: Request, res: Response) {
  defer(() => console.log('Hello request completed'));
  res.json({ message: 'Hello, world!' });
}