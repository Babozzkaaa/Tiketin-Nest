// // ga terlalu kepake karna punya jwt guard
// import {
//   Injectable,
//   NestMiddleware,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private jwtService: JwtService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const token = this.extractTokenFromHeader(req);

//     if (!token) {
//       throw new UnauthorizedException('Token not found');
//     }

//     try {
//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: process.env.jwtSecretKey,
//       });
//       req['user'] = payload;
//       next();
//     } catch (error) {
//       throw new UnauthorizedException('Token verification failed');
//     }
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }
