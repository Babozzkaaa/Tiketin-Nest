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
//   UseGuards,
// } from '@nestjs/common';
// import { AddressService } from './address.service';
// import { WebResponse } from '../model/web.model';
// import {
//   AddressResponse,
//   CreateAddressRequest,
//   GetAddressRequest,
//   RemoveAddressRequest,
//   UpdateAddressRequest,
// } from '../model/address.model';
// import { User } from '@prisma/client';
// import { Auth } from '../common/auth.decorator';
// import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
// import { JwtGuard } from 'src/auth/guards/jwt.guard';

// @UseGuards(JwtGuard)
// @Controller('/api/contacts/:contactId/addresses')
// export class AddressController {
//   constructor(private addressService: AddressService) {}

//   @Post()
//   @ApiBearerAuth()
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         street: { type: 'string', example: '123 Main St', nullable: true },
//         city: { type: 'string', example: 'Anytown', nullable: true },
//         province: { type: 'string', example: 'Anystate', nullable: true },
//         country: { type: 'string', example: 'USA' },
//         postal_code: { type: 'string', example: '12345' },
//       },
//       required: ['country', 'postal_code'],
//     },
//   })
//   @HttpCode(200)
//   async create(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//     @Body() request: CreateAddressRequest,
//   ): Promise<WebResponse<AddressResponse>> {
//     request.contact_id = contactId;
//     const result = await this.addressService.create(user, request);
//     return {
//       data: result,
//     };
//   }

//   @Get('/:addressId')
//   @ApiBearerAuth()
//   @HttpCode(200)
//   async get(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//     @Param('addressId', ParseIntPipe) addressId: number,
//   ): Promise<WebResponse<AddressResponse>> {
//     const request: GetAddressRequest = {
//       address_id: addressId,
//       contact_id: contactId,
//     };
//     const result = await this.addressService.get(user, request);
//     return {
//       data: result,
//     };
//   }

//   @Put('/:addressId')
//   @ApiBearerAuth()
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         street: { type: 'string', example: '123 Main St', nullable: true },
//         city: { type: 'string', example: 'Anytown', nullable: true },
//         province: { type: 'string', example: 'Anystate', nullable: true },
//         country: { type: 'string', example: 'USA' },
//         postal_code: { type: 'string', example: '12345' },
//       },
//       required: ['country', 'postal_code'],
//     },
//   })
//   @HttpCode(200)
//   async update(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//     @Param('addressId', ParseIntPipe) addressId: number,
//     @Body() request: UpdateAddressRequest,
//   ): Promise<WebResponse<AddressResponse>> {
//     request.contact_id = contactId;
//     request.id = addressId;
//     const result = await this.addressService.update(user, request);
//     return {
//       data: result,
//     };
//   }

//   @Delete('/:addressId')
//   @ApiBearerAuth()
//   @HttpCode(200)
//   async remove(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//     @Param('addressId', ParseIntPipe) addressId: number,
//   ): Promise<WebResponse<boolean>> {
//     const request: RemoveAddressRequest = {
//       address_id: addressId,
//       contact_id: contactId,
//     };
//     await this.addressService.remove(user, request);
//     return {
//       data: true,
//     };
//   }

//   @Get()
//   @ApiBearerAuth()
//   @HttpCode(200)
//   async list(
//     @Auth() user: User,
//     @Param('contactId', ParseIntPipe) contactId: number,
//   ): Promise<WebResponse<AddressResponse[]>> {
//     const result = await this.addressService.list(user, contactId);
//     return {
//       data: result,
//     };
//   }
// }
