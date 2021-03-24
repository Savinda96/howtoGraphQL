async function feed(parent, args, context, info) {
  const where = args.filter
    ? {
        OR: [
          { description: { contains: args.filter } },
          { url: { contains: args.filter } },
        ],
      }
    : {};

  const links = await context.prisma.link.findMany({
    where,
    skip: args.skip,
    take: args.take,
  });

  return links;
}

function link(parent, args, context, info) {
  return context.prisma.link.findUnique({ where: { id: parseInt(args.id) } });
}

module.exports = {
  feed,
  link,
};
