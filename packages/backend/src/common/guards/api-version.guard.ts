import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_VERSION_KEY } from '../decorators/api-version.decorator';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredVersion = this.reflector.getAllAndOverride<string>(API_VERSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredVersion) {
      return true; // No version requirement
    }

    const request = context.switchToHttp().getRequest();
    const requestVersion = request.headers['api-version'] || 'v1';

    return requestVersion === requiredVersion;
  }
}
