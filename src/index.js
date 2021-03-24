const { ApolloServer } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");
const { GraphQLScalarType, Kind } = require("graphql");
const { getUserId } = require("./utils");
const fs = require("fs");
const path = require("path");
const { PubSub } = require("apollo-server");

const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutations");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Vote = require("./resolvers/Votes");
const Subscription = require("./resolvers/Subscription");

const pubsub = new PubSub();

const prisma = new PrismaClient();

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value; // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

const resolvers = {
  Query,
  Mutation,
  User,
  Subscription,
  Link,
  Vote,
  Date: dateScalar,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  context: ({ req }) => {
    //console.log(req);
    return {
      ...req,
      prisma,
      pubsub,
      userId: req && req.headers.authorization ? getUserId(req) : null,
    };
  },
});
server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
