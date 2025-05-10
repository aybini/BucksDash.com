export const authOptions = {
  // Add your authentication options here
  // Example:
  // providers: [
  //   CredentialsProvider({
  //     name: 'credentials',
  //     async authorize(credentials, req) {
  //       // Add your authentication logic here
  //       return null
  //     },
  //   }),
  // ],
  session: {
    strategy: "jwt", // or "database"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
