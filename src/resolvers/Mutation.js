const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Mutations = {
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // hash the password
    const password = await bcrypt.hash(args.password, 10);
    // create a new user
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
        },
      },
      info
    );

    // generate JWT token
    const token = jwt.sign({ userId: user.id }, "my-secret");

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },

  async signin(parent, args, ctx, info) {
    const { email, password } = args;
    // check if user is present in DB
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error("User doesnt exist");
    }

    // check if password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid password");
    }

    // generate JWT token
    const token = jwt.sign({ userId: user.id }, "my-secret");

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },

  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token", "expires", {
      maxAge: 0,
    });

    return true;
  },

  async createNote(parent, args, ctx, info) {
    if (!ctx.request.currentUser) {
      throw new Error("You need to be logged in");
    }
    const item = await ctx.db.mutation.createNote(
      {
        data: {
          user: {
            connect: { id: ctx.request.currentUser.id },
          },
          ...args,
        },
      },
      info
    );
    return item;
  },

  async updateNote(parent, args, ctx, info) {
    const dataToUpdate = { ...args };
    // we should not update id
    delete dataToUpdate.id;

    return await ctx.db.mutation.updateNote(
      {
        data: dataToUpdate,
        where: { id: args.id },
      },
      info
    );
  },

  async deleteNote(parent, args, ctx, info) {
    // find the note
    const note = await ctx.db.query.note({
      where: { id: args.id },
    });

    // check if note belongs to current user
    if (note.user.id !== ctx.request.currentUser.id) {
      throw new Error("You do not own this");
    }

    // delete it
    return await ctx.db.mutation.deleteNote(
      {
        where: { id: args.id },
      },
      info
    );
  },
};

module.exports = Mutations;
