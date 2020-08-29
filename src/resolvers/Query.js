const { forwardTo } = require("prisma-binding");

const Queries = {
  notesConnection: forwardTo("db"),

  async note(parent, args, ctx, info) {
    // check if user is logged in
    if (!ctx.request.currentUser) {
      throw new Error("Please login");
    }

    // fetch notes related to the currentUser
    return ctx.db.query.notes(
      {
        where: {
          user: { id: currentUser.id },
        },
      },
      ctx
    );
  },

  async notes(parent, args, ctx, info) {
    // check if user is logged in
    if (!ctx.request.currentUser) {
      throw new Error("Please login");
    }

    return ctx.db.query.notes({
      where: {
        user: { id: ctx.request.currentUser.id },
      },
      skip: args.skip,
      first: args.first,
    });

    // const query = `SELECT * FROM "Note" "note" INNER JOIN "User" "user" on "user"."id" = note.user  where "user"."id" = $1`;
    // const values = [ctx.request.currentUser.id];
    // return ctx.pg
    //   .query(query, values)
    //   .catch((err) => console.log(err))
    //   .then((data) => data);
  },
};

module.exports = Queries;
