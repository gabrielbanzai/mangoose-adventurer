# Usa a imagem leve do Nginx
FROM nginx:alpine

# Copia todo o conteúdo do projeto para o Nginx
COPY . /usr/share/nginx/html

# Expõe a porta que queremos usar
EXPOSE 3101

# Comando padrão do Nginx (não precisa mudar)
CMD ["nginx", "-g", "daemon off;"]
