FROM node:18-alpine

# Copia todo o projeto
COPY . .

# Instala o servidor estático "serve"
RUN npm install -g serve

# Expõe a porta que você quer usar no Dokploy
EXPOSE 3105

# Inicia o servidor estático na porta 3105
CMD ["serve", "-s", ".", "-l", "3105"]
