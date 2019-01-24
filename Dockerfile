FROM nginx:alpine
COPY dist/rhizomerEye /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
