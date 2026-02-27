# Guia de Contribuição

Obrigado por considerar contribuir com este projeto! 🎉

## 📋 Como Contribuir

### 1. Fork o Projeto

Clique no botão "Fork" no canto superior direito da página do repositório.

### 2. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/ecommerce.git
cd ecommerce
```

### 3. Crie uma Branch

```bash
git checkout -b feature/nome-da-sua-feature
```

### 4. Configure o Ambiente

#### Backend (Server)

```bash
cd server
cp .env.example .env
# Configure as variáveis de ambiente
npm install
npx prisma generate
npx prisma migrate dev
```

### 5. Faça suas Alterações

- Escreva código limpo e bem documentado
- Siga os padrões de código do projeto
- Adicione testes quando apropriado
- Atualize a documentação se necessário

### 6. Teste suas Alterações

```bash
# Backend
cd server
npm run test
npm run test:e2e
npm run lint
```

### 7. Commit suas Mudanças

Siga o padrão de commits:

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

#### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adiciona testes
- `chore`: Atualização de tarefas, configurações, etc

### 8. Push para o GitHub

```bash
git push origin feature/nome-da-sua-feature
```

### 9. Abra um Pull Request

- Vá até o repositório original no GitHub
- Clique em "Pull Request"
- Selecione sua branch
- Adicione uma descrição clara do que foi alterado
- Aguarde a revisão

## 🎯 Boas Práticas

### Código

- Use nomes descritivos para variáveis e funções
- Mantenha funções pequenas e focadas
- Evite código duplicado
- Comente apenas o que não é óbvio
- Use TypeScript de forma adequada (evite `any`)

### Git

- Commits pequenos e frequentes
- Mensagens de commit claras e descritivas
- Uma funcionalidade por branch
- Mantenha sua branch atualizada com a main

### Testes

- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes alta
- Testes devem ser rápidos e confiáveis

## 📝 Reportando Bugs

Ao reportar bugs, inclua:

1. Descrição clara do problema
2. Passos para reproduzir
3. Comportamento esperado vs. atual
4. Screenshots se aplicável
5. Ambiente (OS, versão do Node, etc)

## 💡 Sugerindo Melhorias

Para sugerir melhorias:

1. Descreva a funcionalidade sugerida
2. Explique por que seria útil
3. Forneça exemplos de uso
4. Considere a viabilidade técnica

## 📞 Dúvidas?

Se tiver dúvidas, abra uma issue ou entre em contato.

## 🙏 Agradecimentos

Obrigado por contribuir! Cada contribuição, por menor que seja, é muito valiosa.
