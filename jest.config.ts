import type { Config } from "jest";

const config: Config = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: ".",
    testEnvironment: "node",
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },
    moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/src/$1",
    },
    collectCoverageFrom: ["**/*.(t|j)s"],
    coverageDirectory: "./coverage",
    transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
};

export default config;
