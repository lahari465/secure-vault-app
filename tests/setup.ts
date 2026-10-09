// `server-only` throws when imported outside Next's server bundle. In tests we
// are on the server, so replace it with an empty module.
import { mock } from "node:test"

// mock.module exists at runtime (Node 22 with --experimental-test-module-mocks)
// but is missing from the installed @types/node.
;(mock as unknown as { module: (id: string, options: object) => void }).module("server-only", { namedExports: {} })
