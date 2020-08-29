const { Prisma } = require("prisma-binding");
const { Client } = require("pg");

const pg = new Client({
  database: "prisma-example",
  user: "postgres",
  host: "localhost",
  port: 5432,
  schema: "public",
});

const db = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: "http://localhost:4466",
});

exports.pg = pg;
exports.db = db;
