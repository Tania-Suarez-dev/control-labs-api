import { RequestHandler } from 'express';
import { authService } from '../container';

export const authenticate: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Basic ')) {
    res.status(401).json({ success: false, code: 'UNAUTHORIZED' });
    return;
  }

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    const email = separator === -1 ? decoded : decoded.slice(0, separator);
    const password = separator === -1 ? '' : decoded.slice(separator + 1);

    req.user = await authService.verify(email, password);
    next();
  } catch {
    res.status(401).json({ success: false, code: 'UNAUTHORIZED' });
  }
};