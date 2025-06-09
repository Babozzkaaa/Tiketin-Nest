// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   HttpCode,
//   Param,
//   ParseIntPipe,
//   Post,
//   Put,
//   Query,
//   UseGuards,
// } from '@nestjs/common';
// import { ContactService } from './contact.service';
// import { Auth } from 'src/common/auth.decorator';
// import { User } from '@prisma/client';
// import {
//   ContactResponse,
//   CreateContactRequest,
//   SearchContactRequest,
//   UpdateContactRequest,
// } from 'src/model/contact.model';
// import { WebResponse } from 'src/model/web.model';
// import { JwtGuard } from 'src/auth/guards/jwt.guard';
// import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

// @UseGuards(JwtGuard)
// @Controller('/api/contacts')
// export class ContactController {
//   constructor(private contactService: ContactService) {}
//   @Post()
//   @ApiBearerAuth()
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         first_name: { type: 'string', example: 'John' },
//         last_name: { type: 'string', example: 'Doe', nullable: true },
//         email: {
//           type: 'string',
//           example: 'john.doe@example.com',
//           nullable: true,
//         },
//         phone: { type: 'string', example: '1234567890', nullable: true },
//       },
//       required: ['first_name'],
//     },
//   })
//   @HttpCode(200)
//   async create(
//     @Auth() user: User,
//     @Body() request: CreateContactRequest,
//   ): Promise<WebResponse<ContactResponse>> {
//     const result = await this.contactService.create(user, request);
//     return {
//       data: result,
//     };
//   }

//   @Get('/:contactId')
//   @ApiBearerAuth()
//   @HttpCode(200)
//   async get(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//   ): Promise<WebResponse<ContactResponse>> {
//     const result = await this.contactService.get(user, contactId);
//     return {
//       data: result,
//     };
//   }

//   // @Put()
//   // @HttpCode(200)
//   // async update(
//   //   @Auth() user: User,
//   //   @Param('contactId', ParseIntPipe) contactId: number,
//   //   @Body() request: UpdateContactRequest,
//   // ): Promise<WebResponse<ContactResponse>> {
//   //   request.id = contactId;
//   //   const result = await this.contactService.update(user, request);
//   //   return {
//   //     data: result,
//   //   };
//   // }

//   @Put(':id')
//   @ApiBearerAuth()
//   async update(
//     @Auth() user: User,
//     @Param('id', ParseIntPipe) id: number,
//     @Body() request: UpdateContactRequest,
//   ): Promise<ContactResponse> {
//     request.id = id;
//     return this.contactService.update(user, request);
//   }

//   @Delete('/:contactId')
//   @ApiBearerAuth()
//   @HttpCode(200)
//   async remove(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//   ): Promise<WebResponse<boolean>> {
//     await this.contactService.remove(user, contactId);
//     return {
//       data: true,
//     };
//   }

//   @Get('')
//   @ApiBearerAuth()
//   @HttpCode(200)
//   async search(
//     @Auth() user: User,
//     // @Query('name') name?: string,
//     // @Query('email') email?: string,
//     // @Query('phone') phone?: string,
//     @Query('page', new ParseIntPipe({ optional: true })) page?: number,
//     @Query('size', new ParseIntPipe({ optional: true })) size?: number,
//   ): Promise<WebResponse<ContactResponse[]>> {
//     const request: SearchContactRequest = {
//       // name: name,
//       // email: email,
//       // phone: phone,
//       page: page || 1,
//       size: size || 10,
//     };
//     return this.contactService.search(user, request);
//   }

//   @Post('/batch')
//   @ApiBearerAuth()
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         count: { type: 'number', example: 1 },
//       },
//     },
//   })
//   @HttpCode(200)
//   async createBatch(
//     @Auth() user: User,
//     @Body() request: { count: number },
//   ): Promise<WebResponse<ContactResponse[]>> {
//     const result = await this.contactService.createBatch(user, request.count);
//     return {
//       data: result,
//     };
//   }
// }
