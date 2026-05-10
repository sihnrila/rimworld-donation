import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Chzzk HMAC-SHA256 webhook 서명 검증
 * 환경변수 CHZZK_WEBHOOK_SECRET 미설정 시 dev 모드로 skip
 * 헤더: X-Signature-256: sha256=<hex>
 */
export function chzzkHmac(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.CHZZK_WEBHOOK_SECRET;
  if (!secret) {
    // dev mode — 서버 로그에 경고만 출력
    if (req.method === 'POST') {
      console.warn('[chzzk] CHZZK_WEBHOOK_SECRET 미설정 — HMAC 검증 skip (dev mode)');
    }
    next();
    return;
  }

  const sigHeader = req.headers['x-signature-256'] as string | undefined;
  if (!sigHeader) {
    res.status(401).json({ ok: false, error: 'Missing X-Signature-256 header' });
    return;
  }

  const rawBody = JSON.stringify(req.body);
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody, 'utf-8').digest('hex');

  try {
    const sigBuf = Buffer.from(sigHeader);
    const expBuf = Buffer.from(expected);
    // 길이 다르면 즉시 거부 (timingSafeEqual은 같은 길이 필요)
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      res.status(401).json({ ok: false, error: 'Invalid signature' });
      return;
    }
  } catch {
    res.status(401).json({ ok: false, error: 'Signature verification failed' });
    return;
  }

  next();
}
