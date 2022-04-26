module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  collectCoverage: true,
  testEnvironment: "node",
};
