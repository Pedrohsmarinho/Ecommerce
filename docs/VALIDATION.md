# Guia de Validação

## Estratégia de Validação

Este projeto utiliza **class-validator** como solução unificada de validação para garantir consistência e melhor integração com NestJS.

## Por que class-validator?

### Vantagens
1. **Integração Nativa com NestJS** - Funciona perfeitamente com ValidationPipe global
2. **Decorators Intuitivos** - Sintaxe clara e expressiva
3. **Documentação Swagger Automática** - `@ApiProperty` funciona naturalmente
4. **Type Safety** - Classes oferecem melhor type checking do TypeScript
5. **Transformação Automática** - `class-transformer` integrado
6. **Ecosystem Rico** - Ampla comunidade e plugins disponíveis

### Comparação: class-validator vs Zod

| Aspecto | class-validator | Zod |
|---------|----------------|-----|
| Integração NestJS | ✅ Nativa | ⚠️ Requer pipe customizado |
| Swagger | ✅ Automático | ❌ Requer conversão manual |
| TypeScript | ✅ Classes | ✅ Schemas |
| Runtime Safety | ✅ | ✅ |
| Performance | ⚡ Rápido | ⚡ Rápido |
| Manutenibilidade | ✅ Familiar em NestJS | ⚠️ Mais verboso |

## Estrutura de DTOs

### Exemplo Completo

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'User email address' 
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ 
    example: 'StrongPassword123!', 
    description: 'User password',
    minLength: 6 
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiPropertyOptional({ 
    example: '+1234567890',
    description: 'Contact phone number' 
  })
  @IsOptional()
  @IsString()
  contact?: string;
}
```

## Validadores Comuns

### Strings
```typescript
@IsString()
@MinLength(3)
@MaxLength(100)
@Matches(/^[a-zA-Z]+$/, { message: 'Only letters allowed' })
name: string;
```

### Números
```typescript
@IsNumber()
@Min(0)
@Max(1000)
@IsPositive()
price: number;
```

### Emails
```typescript
@IsEmail({}, { message: 'Invalid email format' })
email: string;
```

### Enums
```typescript
@IsEnum(UserType)
type: UserType;
```

### Arrays
```typescript
@IsArray()
@ArrayMinSize(1)
@ArrayMaxSize(10)
@ValidateNested({ each: true })
@Type(() => ItemDTO)
items: ItemDTO[];
```

### Objetos Aninhados
```typescript
@ValidateNested()
@Type(() => AddressDTO)
address: AddressDTO;
```

### Campos Opcionais
```typescript
@IsOptional()
@IsString()
description?: string;
```

## Configuração Global

No `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe({
  transform: true,           // Transforma objetos planos em instâncias de classe
  whitelist: true,           // Remove propriedades não decoradas
  forbidNonWhitelisted: true, // Lança erro se propriedades extras forem enviadas
  transformOptions: {
    enableImplicitConversion: true, // Converte tipos automaticamente
  },
}));
```

## Validação Customizada

### Validator Customizado

```typescript
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isCPF', async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string, args: ValidationArguments) {
    // Lógica de validação de CPF
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
  }

  defaultMessage(args: ValidationArguments) {
    return 'CPF inválido';
  }
}

// Uso
@Validate(IsCPFConstraint)
cpf: string;
```

## Grupos de Validação

Para validações diferentes em contextos diferentes:

```typescript
export class UpdateUserDTO {
  @IsString({ groups: ['admin'] })
  role?: string;

  @IsString({ groups: ['user', 'admin'] })
  name?: string;
}

// No controller
@UsePipes(new ValidationPipe({ groups: ['admin'] }))
updateAsAdmin(@Body() dto: UpdateUserDTO) {}
```

## Mensagens de Erro Personalizadas

```typescript
@IsEmail({}, { 
  message: 'Por favor, forneça um email válido' 
})
email: string;

@MinLength(8, { 
  message: 'A senha deve ter pelo menos $constraint1 caracteres' 
})
password: string;
```

## Melhores Práticas

1. **Sempre use DTOs** - Nunca exponha entities Prisma diretamente
2. **Valide na entrada** - Use ValidationPipe global
3. **Documente com Swagger** - Adicione `@ApiProperty` em todos os campos
4. **Mensagens claras** - Forneça mensagens de erro específicas
5. **Tipos opcionais** - Use `@IsOptional()` para campos não obrigatórios
6. **Transformações** - Use `@Transform()` quando necessário
7. **Validação assíncrona** - Para verificações que requerem banco de dados

## Exemplo Completo de Módulo

```typescript
// dto/create-user.dto.ts
export class CreateUserDTO {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

// user.controller.ts
@Post()
@ApiOperation({ summary: 'Create user' })
@ApiResponse({ status: 201, description: 'User created successfully' })
@ApiResponse({ status: 400, description: 'Validation failed' })
async create(@Body() createUserDto: CreateUserDTO) {
  return this.userService.create(createUserDto);
}
```

## Migrando de Zod para class-validator

1. Remover schemas Zod dos arquivos DTO
2. Converter para classes TypeScript
3. Adicionar decorators `class-validator`
4. Adicionar decorators `@ApiProperty` para Swagger
5. Remover middleware/pipe customizado de Zod
6. Testar validações

## Recursos

- [class-validator Documentation](https://github.com/typestack/class-validator)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [Swagger Decorators](https://docs.nestjs.com/openapi/types-and-parameters)

