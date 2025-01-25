FROM node:22

RUN mkdir -p /home/projects

COPY .. /home/projects

WORKDIR /home/projects

RUN npm install

ENV HOST 0.0.0.0

ENV PORT 3000

EXPOSE 3000

CMD ["npm", "run", "dev"]