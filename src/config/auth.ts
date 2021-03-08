export default {
    jwt: {
      secret: process.env.JWT_PRIVATE_KEY as string,
      expiresIn: "2h",
    },
  };