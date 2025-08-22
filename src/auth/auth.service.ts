import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// const EXPIRE_TIME = 4 * 60 * 60 * 1000;
// const EXPIRE_TIME = 1 * 60 * 1000;
const EXPIRE_TIME = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,

    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
    };

    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          // expiresIn: '1min',
          expiresIn: '15min',
          // expiresIn: '4h',
          secret: process.env.jwtSecretKey,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.jwtRefreshTokenKey,
        }),
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      },
    };
    // this.logger.info(
    //   `Token expired at ${new Date().setTime(new Date().getTime() + EXPIRE_TIME)}`,
    // );
  }

  async validateUser(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException();
  }

  async refreshToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.sub,
      name: user.name,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        // expiresIn: '1min',
        expiresIn: '15min',
        // expiresIn: '4h',
        secret: process.env.jwtSecretKey,
      }),

      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async logout(user: any) {
    return { message: 'Logout successful' };
  }
}
