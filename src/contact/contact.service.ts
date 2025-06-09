// import {
//   HttpException,
//   Inject,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';
// import { PrismaService } from '../common/prisma.service';
// import { Contact, User } from '@prisma/client';
// import {
//   ContactResponse,
//   CreateContactRequest,
//   SearchContactRequest,
//   UpdateContactRequest,
// } from '../model/contact.model';
// import { ValidationService } from '../common/validation.service';
// import { ContactValidation } from './contact.validation';
// import { WebResponse } from '../model/web.model';

// @Injectable()
// export class ContactService {
//   constructor(
//     @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
//     private prismaService: PrismaService,
//     private validationService: ValidationService,
//   ) {}

//   async create(
//     user: User,
//     request: CreateContactRequest,
//   ): Promise<ContactResponse> {
//     this.logger.debug(
//       `ContactService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
//     );
//     const createRequest: CreateContactRequest = this.validationService.validate(
//       ContactValidation.CREATE,
//       request,
//     );

//     const userWhereUniqueInput = user.id
//       ? { id: user.id }
//       : { email: user.email };

//     const contact = await this.prismaService.contact.create({
//       data: {
//         first_name: createRequest.first_name,
//         last_name: createRequest.last_name,
//         email: createRequest.email,
//         phone: createRequest.phone,
//         user: {
//           connect: userWhereUniqueInput,
//         },
//       },
//     });

//     return this.toContactResponse(contact);
//   }

//   toContactResponse(contact: Contact): ContactResponse {
//     return {
//       id: contact.id,
//       first_name: contact.first_name,
//       last_name: contact.last_name,
//       email: contact.email,
//       phone: contact.phone,
//     };
//   }

//   async checkContactMustExists(
//     userId: number,
//     contactId: number,
//   ): Promise<Contact> {
//     const contact = await this.prismaService.contact.findFirst({
//       where: {
//         id_user: userId,
//         id: contactId,
//       },
//     });

//     if (!contact) {
//       throw new HttpException('Contact is not found', 404);
//     }

//     return contact;
//   }

//   async get(user: User, contactId: number): Promise<ContactResponse> {
//     const contact = await this.checkContactMustExists(user.id, contactId);
//     return this.toContactResponse(contact);
//   }

//   async update(
//     user: User,
//     request: UpdateContactRequest,
//   ): Promise<ContactResponse> {
//     this.logger.debug(`Request before validation: ${JSON.stringify(request)}`);

//     const updateRequest = this.validationService.validate(
//       ContactValidation.UPDATE,
//       request,
//     );

//     this.logger.debug(
//       `Request after validation: ${JSON.stringify(updateRequest)}`,
//     );
//     await this.checkContactMustExists(user.id, updateRequest.id);

//     const contact = await this.prismaService.contact.update({
//       where: { id: updateRequest.id },
//       data: {
//         first_name: updateRequest.first_name,
//         last_name: updateRequest.last_name,
//         email: updateRequest.email,
//         phone: updateRequest.phone,
//       },
//     });

//     return this.toContactResponse(contact);
//   }

//   async remove(user: User, contactId: number): Promise<ContactResponse> {
//     await this.checkContactMustExists(user.id, contactId);

//     const contact = await this.prismaService.contact.delete({
//       where: {
//         id: contactId,
//         id_user: user.id,
//       },
//     });

//     return this.toContactResponse(contact);
//   }

//   async search(
//     user: User,
//     request: SearchContactRequest,
//   ): Promise<WebResponse<ContactResponse[]>> {
//     const searchRequest: SearchContactRequest = this.validationService.validate(
//       ContactValidation.SEARCH,
//       request,
//     );

//     const filters = [];

//     if (searchRequest.name) {
//       // add name filter
//       filters.push({
//         OR: [
//           {
//             first_name: {
//               contains: searchRequest.name,
//             },
//           },
//           {
//             last_name: {
//               contains: searchRequest.name,
//             },
//           },
//         ],
//       });
//     }

//     if (searchRequest.email) {
//       // add email filter
//       filters.push({
//         email: {
//           contains: searchRequest.email,
//         },
//       });
//     }

//     if (searchRequest.phone) {
//       // add phone filter
//       filters.push({
//         phone: {
//           contains: searchRequest.phone,
//         },
//       });
//     }

//     const skip = (searchRequest.page - 1) * searchRequest.size;

//     const contacts = await this.prismaService.contact.findMany({
//       where: {
//         id_user: user.id,
//         AND: filters,
//       },
//       take: searchRequest.size,
//       skip: skip,
//     });

//     const total = await this.prismaService.contact.count({
//       where: {
//         id_user: user.id,
//         AND: filters,
//       },
//     });

//     return {
//       data: contacts.map((contact) => this.toContactResponse(contact)),
//       paging: {
//         current_page: searchRequest.page,
//         size: searchRequest.size,
//         total_page: Math.ceil(total / searchRequest.size),
//       },
//     };
//   }

//   async createBatch(user: any, count: number): Promise<ContactResponse[]> {
//     this.logger.debug(
//       `ContactService.createBatch - JWT payload received: ${JSON.stringify(user)}`,
//     );

//     // First find the user by email  in the JWT
//     const dbUser = await this.prismaService.user.findUnique({
//       where: {
//         email: user.email,
//       },
//     });

//     if (!dbUser) {
//       this.logger.error(`User with email ${user.email} not found in database`);
//       throw new UnauthorizedException('User not found');
//     }

//     this.logger.debug(`Found user in database: ${JSON.stringify(dbUser)}`);

//     const existingEmails = await this.prismaService.contact.findMany({
//       where: {
//         email: {
//           contains: '@example.com',
//         },
//       },
//       select: {
//         email: true,
//       },
//       orderBy: {
//         email: 'desc',
//       },
//     });

//     const existingNumbers = new Set(
//       existingEmails
//         .map((contact) => {
//           const match = contact.email?.match(/user(\d+)@example\.com/);
//           return match ? parseInt(match[1]) : null;
//         })
//         .filter((num) => num !== null),
//     );

//     let currentNumber = 1;
//     while (existingNumbers.has(currentNumber)) {
//       currentNumber++;
//     }

//     const contacts: ContactResponse[] = [];
//     const batchSize = Math.min(Math.max(1, count), 1000); // Limit max

//     try {
//       for (let i = 0; i < batchSize; i++) {
//         while (existingNumbers.has(currentNumber)) {
//           currentNumber++;
//         }

//         const contactData: CreateContactRequest = {
//           first_name: `User${currentNumber}`,
//           last_name: `LastName${currentNumber}`,
//           email: `user${currentNumber}@example.com`,
//           phone: `${1234500000 + currentNumber}`,
//         };

//         existingNumbers.add(currentNumber);

//         const validatedData = this.validationService.validate(
//           ContactValidation.CREATE,
//           contactData,
//         );

//         this.logger.debug(
//           `Creating contact ${i + 1}/${batchSize} for user ${dbUser.id}`,
//         );

//         try {
//           // Create the contact using the database user ID
//           const contact = await this.prismaService.contact.create({
//             data: {
//               ...validatedData,
//               id_user: dbUser.id,
//             },
//           });

//           this.logger.debug(
//             `Contact created successfully: ${JSON.stringify(contact)}`,
//           );
//           contacts.push(this.toContactResponse(contact));

//           currentNumber++;
//         } catch (createError) {
//           if (
//             createError.code === 'P2002' &&
//             createError.meta?.target?.includes('email')
//           ) {
//             this.logger.warn(`Email conflict found, trying next number`);
//             i--;
//             continue;
//           }
//           throw createError;
//         }
//       }

//       return contacts;
//     } catch (error) {
//       this.logger.error(`Error in createBatch: ${error.message}`, error.stack);
//       throw new HttpException(
//         error.message || 'Error creating batch contacts',
//         error.status || 500,
//       );
//     }
//   }
// }
