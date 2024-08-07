import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip;

    try {
      await this.rateLimiter.consume(ip);
      return true;
    } catch (rejRes) {
      return false;
    }
  }
}
