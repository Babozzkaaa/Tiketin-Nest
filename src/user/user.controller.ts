import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('/protected-test')
  async protectedTest(@Req() req: any) {
    return {
      success: true,
      message: 'Protected data accessed successfully',
      timestamp: new Date().toISOString(),
      user: req.user,
    };
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @UseGuards(JwtGuard)
  @Get('/all')
  async getAllUsers() {
    return await this.userService.getAllUser();
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findById(id);
  }
}
