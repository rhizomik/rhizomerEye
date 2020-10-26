FROM nginx:alpine
COPY dist/rhizomerEye /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

RUN echo "for f in \$(find /usr/share/nginx/html -name 'main*.js'); do \
          envsubst '\$API_URL' < \$f > main.tmp ; \
          mv main.tmp \$f ; done && \
          envsubst '\$GA_MEASUREMENT_ID' < /usr/share/nginx/html/index.html > index.tmp && \
          mv index.tmp /usr/share/nginx/html/index.html && \
          nginx -g 'daemon off;'" > run.sh

ENTRYPOINT ["sh", "run.sh"]
