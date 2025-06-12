#!/bin/bash

echo "🚀 Iniciando limpeza dos DTOs..."

# Remover DTOs duplicados no módulo auth
echo "📁 Limpando DTOs duplicados no módulo auth..."
rm -f src/auth/dto/LoginRequestDTO.ts
rm -f src/auth/dto/RegisterRequestDTO.ts
rm -f src/auth/dto/TokenVerificationDTO.ts

# Remover DTOs duplicados no módulo user
echo "📁 Limpando DTOs duplicados no módulo user..."
rm -f src/user/dto/CreateUserDTO.ts
rm -f src/user/dto/EmailVerificationDTO.ts
rm -f src/user/dto/ResendVerificationDTO.ts

# Atualizar imports nos arquivos que usam esses DTOs
echo "📝 Atualizando imports..."

# Atualizar imports no auth.controller.ts
sed -i '' 's/LoginRequestDTO/login.dto/g' src/auth/auth.controller.ts
sed -i '' 's/RegisterRequestDTO/register.dto/g' src/auth/auth.controller.ts
sed -i '' 's/TokenVerificationDTO/token-verification.dto/g' src/auth/auth.controller.ts

# Atualizar imports no user.controller.ts
sed -i '' 's/CreateUserDTO/create-user.dto/g' src/user/user.controller.ts
sed -i '' 's/EmailVerificationDTO/email-verification.dto/g' src/user/user.controller.ts
sed -i '' 's/ResendVerificationDTO/resend-verification.dto/g' src/user/user.controller.ts

echo "✨ Limpeza dos DTOs concluída!"