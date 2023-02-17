import * as process from "process";

export const config = {
  API_PORT: process.env.PORT || 8080,
  MONGO: {
    URI: "mongodb://localhost:27017"
  },
  SECRET: 'mySecret'
}
