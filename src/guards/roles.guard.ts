import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/emums/role.enum';
import { timeout } from 'rxjs/operators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    @Inject('AUTH_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();

    try {
      const res = (await this.client
        .send(
          { role: 'auth', cmd: 'check' },
          { jwt: req.headers['authorization']?.split(' ')[1] },
        )
        .pipe(timeout(5000))
        .toPromise<boolean>()) as any;
      console.log(res);

      return requiredRoles.some((role) => res?.user.roles?.includes(role));
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }
}
