import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.user?.sub) {
      return req.user.sub;
    }

    const ip = req.ips?.length ? req.ips[0] : req.ip;
    return ip || 'anonymous';
  }
}
