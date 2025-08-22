// @ts-check
const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');
const { cwd } = require('process');
const pluralize = require('pluralize');

const ORIGIN_PATH = cwd() + '/scripts/generators/templates';

// Templates for different file types
const templates = {
  controller: `import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { {{className}}Service } from './{{fileName}}.service';
import { WebResponse } from '../../model/web.model';
import {
  {{className}}Response,
  Create{{className}}Request,
  Get{{className}}Request,
  Remove{{className}}Request,
  Update{{className}}Request,
} from '../../model/{{fileName}}.model';
import { User } from '@prisma/client';
import { Auth } from '../../common/auth.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('/api/{{pluralName}}')
export class {{className}}Controller {
  constructor(private {{variableName}}Service: {{className}}Service) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: Create{{className}}Request,
  ): Promise<WebResponse<{{className}}Response>> {
    const result = await this.{{variableName}}Service.create(user, request);
    return {
      data: result,
    };
  }

  @Get('/:id')
  @ApiBearerAuth()
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<{{className}}Response>> {
    const result = await this.{{variableName}}Service.get(user, id);
    return {
      data: result,
    };
  }

  @Put('/:id')
  @ApiBearerAuth()
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: Update{{className}}Request,
  ): Promise<WebResponse<{{className}}Response>> {
    request.id = id;
    const result = await this.{{variableName}}Service.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<boolean>> {
    await this.{{variableName}}Service.remove(user, id);
    return {
      data: true,
    };
  }

  @Get()
  @ApiBearerAuth()
  @HttpCode(200)
  async list(
    @Auth() user: User,
  ): Promise<WebResponse<{{className}}Response[]>> {
    const result = await this.{{variableName}}Service.list(user);
    return {
      data: result,
    };
  }
}`,

  service: `import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { {{modelName}}, User } from '@prisma/client';
import {
  {{className}}Response,
  Create{{className}}Request,
  Get{{className}}Request,
  Remove{{className}}Request,
  Update{{className}}Request,
} from '../../model/{{fileName}}.model';
import { {{className}}Validation } from './{{fileName}}.validation';

@Injectable()
export class {{className}}Service {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: Create{{className}}Request,
  ): Promise<{{className}}Response> {
    this.logger.debug(
      \`{{className}}Service.create(\${JSON.stringify(user)}, \${JSON.stringify(request)})\`,
    );
    const createRequest: Create{{className}}Request = this.validationService.validate(
      {{className}}Validation.CREATE,
      request,
    );

    const {{variableName}} = await this.prismaService.{{lowerModelName}}.create({
      data: createRequest,
    });

    return this.to{{className}}Response({{variableName}});
  }

  to{{className}}Response({{variableName}}: {{modelName}}): {{className}}Response {
    return {
      id: {{variableName}}.id,
      // Add other fields based on your model
    };
  }

  async check{{className}}MustExists(id: number): Promise<{{modelName}}> {
    const {{variableName}} = await this.prismaService.{{lowerModelName}}.findUnique({
      where: { id },
    });

    if (!{{variableName}}) {
      throw new HttpException('{{className}} is not found', 404);
    }

    return {{variableName}};
  }

  async get(user: User, id: number): Promise<{{className}}Response> {
    const {{variableName}} = await this.check{{className}}MustExists(id);
    return this.to{{className}}Response({{variableName}});
  }

  async update(
    user: User,
    request: Update{{className}}Request,
  ): Promise<{{className}}Response> {
    const updateRequest: Update{{className}}Request = this.validationService.validate(
      {{className}}Validation.UPDATE,
      request,
    );

    let {{variableName}} = await this.check{{className}}MustExists(updateRequest.id);

    {{variableName}} = await this.prismaService.{{lowerModelName}}.update({
      where: { id: {{variableName}}.id },
      data: updateRequest,
    });

    return this.to{{className}}Response({{variableName}});
  }

  async remove(user: User, id: number): Promise<{{className}}Response> {
    await this.check{{className}}MustExists(id);

    const {{variableName}} = await this.prismaService.{{lowerModelName}}.delete({
      where: { id },
    });

    return this.to{{className}}Response({{variableName}});
  }

  async list(user: User): Promise<{{className}}Response[]> {
    const {{pluralVariableName}} = await this.prismaService.{{lowerModelName}}.findMany();
    return {{pluralVariableName}}.map(({{variableName}}) => this.to{{className}}Response({{variableName}}));
  }
}`,

  module: `import { Module } from '@nestjs/common';
import { {{className}}Service } from './{{fileName}}.service';
import { {{className}}Controller } from './{{fileName}}.controller';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';

@Module({
  providers: [{{className}}Service, PrismaService, ValidationService],
  controllers: [{{className}}Controller],
  exports: [{{className}}Service],
})
export class {{className}}Module {}`,

  validation: `import { z, ZodType } from 'zod';

export class {{className}}Validation {
  static readonly CREATE: ZodType = z.object({
    // Define your create validation schema here
    // Example:
    // name: z.string().min(1).max(100),
  });

  static readonly GET: ZodType = z.object({
    id: z.number().min(1).positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().min(1).positive(),
    // Define your update validation schema here
    // Example:
    // name: z.string().min(1).max(100).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().min(1).positive(),
  });
}`,

  model: `export class {{className}}Response {
  id: number;
  // Add other response fields based on your Prisma model
  // Example:
  // name: string;
  // createdAt: Date;
  // updatedAt: Date;
}

export class Create{{className}}Request {
  // Add create request fields
  // Example:
  // name: string;
  // description?: string;
}

export class Get{{className}}Request {
  id: number;
}

export class Update{{className}}Request {
  id: number;
  // Add update request fields
  // Example:
  // name?: string;
  // description?: string;
}

export class Remove{{className}}Request {
  id: number;
}`,
};

const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/ (.)/g, function ($1) {
      return $1.toUpperCase();
    })
    .replace(/ /g, '');
};

const toPascalCase = (str) => {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

function getPrismaModel() {
  const prismaSchemaPath = path.join(cwd(), 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
  const modelRegex = /model\s+(\w+)\s+\{/g;
  const models = [];
  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    models.push(match[1]);
  }
  return models;
}

const compile = (template, variables) => {
  const hbsTemplate = hbs.compile(template);
  return hbsTemplate(variables);
};

async function main() {
  const term = (await import('inquirer')).default;
  const models = getPrismaModel();

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: "What's your feature name?",
    },
    {
      type: 'list',
      name: 'model',
      message: 'Choose your Prisma model:',
      choices: models,
    },
  ];

  const answers = await term.prompt(questions);

  const className = toPascalCase(answers.name);
  const fileName = answers.name.toLowerCase();
  const variableName = toCamelCase(answers.name);
  const modelName = answers.model;
  const lowerModelName = modelName.toLowerCase();
  const pluralName = pluralize(fileName);
  const pluralVariableName = pluralize(variableName);

  const variables = {
    className,
    fileName,
    variableName,
    modelName,
    lowerModelName,
    pluralName,
    pluralVariableName,
  };

  // Create app directory structure
  const appDir = path.join(cwd(), 'src', 'app');
  const moduleDir = path.join(appDir, fileName);
  const modelDir = path.join(cwd(), 'src', 'model');

  // Create directories if they don't exist
  [appDir, moduleDir, modelDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate module files in src/app/{feature}/
  const moduleFiles = [
    { name: `${fileName}.controller.ts`, template: templates.controller },
    { name: `${fileName}.service.ts`, template: templates.service },
    { name: `${fileName}.module.ts`, template: templates.module },
    { name: `${fileName}.validation.ts`, template: templates.validation },
  ];

  moduleFiles.forEach((file) => {
    const content = compile(file.template, variables);
    const filePath = path.join(moduleDir, file.name);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  });

  // Generate model file in src/model/
  const modelContent = compile(templates.model, variables);
  const modelFilePath = path.join(modelDir, `${fileName}.model.ts`);
  fs.writeFileSync(modelFilePath, modelContent);
  console.log(`✅ Created: ${modelFilePath}`);

  console.log(`\n🎉 Successfully generated ${className} module!`);
  console.log(`📁 Module files created in: src/app/${fileName}/`);
  console.log(`📁 Model file created in: src/model/${fileName}.model.ts`);
  console.log(`\n📝 Don't forget to:`);
  console.log(`   1. Add the ${className}Module to your app.module.ts imports`);
  console.log(`   2. Update the model interfaces with your actual fields`);
  console.log(`   3. Update the validation schemas with your actual fields`);
  console.log(`   4. Update the service methods with your business logic`);
}

main().catch(console.error);
