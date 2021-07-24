module.exports = {
  entry: "http",
  output: {
    library: "http",
  },
  target: "node",
  resolve: {
    fallback: {
      http: require.resolve('stream-http')
    }
  }
};
