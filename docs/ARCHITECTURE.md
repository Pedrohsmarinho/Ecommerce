# Arquitetura do Projeto

## Visão Geral

Este projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, separando responsabilidades em camadas distintas.

## Camadas da Aplicação

### 1. Controllers (Camada de Apresentação)
- Responsável por receber requisições HTTP
- Valida entrada de dados via DTOs
- Delega lógica de negócio aos Services
- Retorna respostas HTTP formatadas

**Exemplo:** `user.controller.ts`

### 2. Services (Camada de Aplicação)
- Contém a lógica de negócio da aplicação
- Orquestra chamadas aos repositórios
- Gerencia transações e regras de negócio complexas
- **NÃO** deve conter lógica de acesso a dados diretamente

**Exemplo:** `user.service.ts`

### 3. Repositories (Camada de Infraestrutura/Dados)
- Abstração para acesso a dados
- Implementa operações CRUD
- Isola lógica de persistência do Prisma
- Permite troca de ORM/banco sem afetar Services

**Exemplo:** `user.repository.ts`

### 4. DTOs (Data Transfer Objects)
- Define estrutura de dados de entrada/saída
- Validação via `class-validator`
- Documentação via Swagger decorators

**Exemplo:** `create-user.dto.ts`

## Padrão Repository

### Por que usar Repository Pattern?

1. **Separação de Responsabilidades (SRP)**
   - Services focam em lógica de negócio
   - Repositories focam em persistência

2. **Inversão de Dependência (DIP)**
   - Services dependem de interfaces, não implementações
   - Facilita mocks em testes

3. **Testabilidade**
   - Fácil criar mocks de repositórios
   - Testes unitários mais rápidos

4. **Manutenibilidade**
   - Mudanças no banco/ORM isoladas em um lugar
   - Queries complexas centralizadas

### Estrutura de Repositório

```
src/
  user/
    repositories/
      user.repository.interface.ts   # Interface (contrato)
      user.repository.ts              # Implementação
    user.service.ts                   # Usa o repositório
    user.module.ts                    # Registra providers
```

### Exemplo de Uso

```typescript
// user.service.ts
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async findAll() {
    return this.userRepository.findAll();
  }
}
```

### Benefícios Implementados

- ✅ Lógica de negócio separada de persistência
- ✅ Facilita testes com mocks
- ✅ Permite trocar ORM sem afetar Services
- ✅ Queries centralizadas e reutilizáveis
- ✅ Segue princípios SOLID

## Próximos Passos

Para continuar melhorando a arquitetura:

1. **Refatorar outros módulos** para usar Repository Pattern
2. **Criar Use Cases** para lógica de negócio complexa
3. **Implementar Domain Events** para desacoplar módulos
4. **Adicionar validações de domínio** em entidades
5. **Usar Dependency Injection** para configurações externas (Redis, S3)

## Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

