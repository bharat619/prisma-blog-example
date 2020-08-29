const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const Server = require("./server");
const { db, pg } = require("./db");

const server = Server();

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, "my-secret");
    req.userId = userId;
  }
  next();
});

server.express.use(async (req, res, next) => {
  if (!req.userId) return next();
  const currentUser = await db.query.user(
    {
      where: { id: req.userId },
    },
    `{
      id
  first_name
  last_name
  email
    }`
  );
  req.currentUser = currentUser;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: "http://localhost:3000",
    },
  },
  (deets) => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
