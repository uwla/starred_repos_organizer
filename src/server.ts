import { App } from "@tinyhttp/app"
import { cors } from "@tinyhttp/cors"
import chalk from "chalk"
import { watch } from "chokidar"
import { existsSync, writeFileSync } from "fs"
import { Observer } from "json-server/lib/observer"
import { Data } from "json-server/lib/service"
import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"
import { json } from "milliparsec"

import repoProvider from "./repo"
import { Repo, Topic, TopicAliases } from "./types"
import {
    addRepo,
    addRepos,
    delRepo,
    delRepos,
    enforceTopicRestrictions,
    updateRepo,
    updateRepos,
} from "./utils"

/* -------------------------------------------------------------------------- */
// Set up database

const file = "user-data.json" // path relative to CWD of the process
const adapter = new JSONFile(file)
const observer = new Observer(adapter)
const db = new Low(observer, {}) as Low<Data>
await db.read()

// INFO: [Edge case fix] LowDB library fails to create temp file before writing
// to data file when running inside a container.
const tmpFile = `.${file}.tmp`
if (!existsSync(tmpFile)) {
    writeFileSync(tmpFile, "{}", "utf8")
}

/* -------------------------------------------------------------------------- */
// Database helpers

const dbGetRepos = () => {
    return db.data.repos as Repo[]
}

const dbSetRepos = async (repos: Repo[]) => {
    const allowedTopics = (db.data.topics_allowed || []) as unknown[] as Topic[]
    const topicAliases = (db.data.topic_aliases || []) as TopicAliases
    db.data.repos = enforceTopicRestrictions(repos, allowedTopics, topicAliases)
    await db.write()
}

const dbAddRepo = async (repo: Repo) => {
    return dbSetRepos(addRepo(dbGetRepos(), repo))
}

const dbAddRepos = async (repos: Repo[]) => {
    return dbSetRepos(addRepos(dbGetRepos(), repos))
}

const dbDelRepo = async (repo: Repo | Repo["id"]) => {
    return dbSetRepos(delRepo(dbGetRepos(), repo))
}

const dbDelRepos = async (repos: Repo[] | Repo["id"][]) => {
    return dbSetRepos(delRepos(dbGetRepos(), repos))
}

const dbUpdateRepo = async (repo: Repo) => {
    return dbSetRepos(updateRepo(dbGetRepos(), repo))
}

const dbUpdateRepos = async (repos: Repo[]) => {
    return dbSetRepos(updateRepos(dbGetRepos(), repos))
}

const dbFindRepo = (id: string) => dbGetRepos().find((r: Repo) => r.id === id)

/* -------------------------------------------------------------------------- */
// Set up http app.

const app = new App()
app.use(json())
app.use(cors())

/* -------------------------------------------------------------------------- */
// Set up routes

// Get repos
app.get("/repo", async (_request, response) => {
    response.send(dbGetRepos())
})

// Get repo
app.get("/repo/:id", (request, response) => {
    const { id } = request.params
    response.send(dbFindRepo(id))
})

// Create single repository
app.post("/repo", async (request, response) => {
    const data = request.body
    let repo: Repo
    if (typeof data.url === "string") {
        repo = await repoProvider.getRepo(data.url)
    } else {
        repo = data as Repo
    }
    await dbAddRepo(repo)
    response.send(dbFindRepo(repo["id"]) || repo)
})

// Update single repository
app.post("/repo/:id", async (request, response) => {
    const repo = request.body as Repo
    const { id } = request.params
    await dbUpdateRepo(repo)
    response.send(dbFindRepo(id))
})

// Delete single repository
app.delete("/repo/:id", async (request, response) => {
    const { id = "" } = request.params
    const prevRepoCount = dbGetRepos().length
    await dbDelRepo(id)
    const currRepoCount = dbGetRepos().length
    const success = prevRepoCount - 1 === currRepoCount
    response.send({ success })
})

// Create many repositories
app.post("/repos", async (request, response) => {
    const data = request.body
    await dbAddRepos(data)
    response.send(dbGetRepos())
})

// Update many repositories
app.put("/repos", async (request, response) => {
    const data = request.body
    await dbUpdateRepos(data)
    response.send(dbGetRepos())
})

// Delete multiple repositories
app.patch("/repos", async (request, response) => {
    const { ids } = request.body
    const prevRepoCount = dbGetRepos().length
    await dbDelRepos(ids)
    const currRepoCount = dbGetRepos().length
    const success = prevRepoCount - ids.length === currRepoCount
    response.send({ success })
})

// Get allowed topics
app.get("/topics/allowed", async (_request, response) => {
    response.send(db.data["topics_allowed"] || [])
})

// Get topic aliases
app.get("/topics/aliases", async (_request, response) => {
    response.send(db.data["topic_aliases"] || {})
})

// Set allowed topics
app.post("/topics/allowed", async (request, response) => {
    db.data["topics_allowed"] = request.body.topics
    await db.write()
    response.send(db.data["topics_allowed"])
})

// Set topic aliases
app.post("/topics/aliases", async (request, response) => {
    db.data["topic_aliases"] = request.body.topics
    await db.write()
    response.send(db.data["topic_aliases"])
})

// ──────────────────────────────────────────────────────────────────────
// Start server
const port = 3000
const host = "0.0.0.0"
app.listen(
    port,
    () => {
        console.log(
            [
                chalk.bold(`JSON Server started on ${host}:${port}`),
                chalk.gray("Press CTRL-C to stop"),
                chalk.gray(`Watching ${file}...`),
            ].join("\n")
        )
    },
    host
)

/* -------------------------------------------------------------------------- */

let writing = false // true if the file is being written to by the app
let prevEndpoints = ""
observer.onWriteStart = () => {
    writing = true
}
observer.onWriteEnd = () => {
    writing = false
}
observer.onReadStart = () => {
    prevEndpoints = JSON.stringify(Object.keys(db.data).sort())
}
observer.onReadEnd = (data: unknown) => {
    if (data === null) {
        return
    }
    const nextEndpoints = JSON.stringify(Object.keys(data as Data).sort())
    if (prevEndpoints !== nextEndpoints) {
        console.log()
    }
}

watch(file).on("change", () => {
    // Do no reload if the file is being written to by the app
    if (!writing) {
        db.read().catch(e => {
            let logMsg = e
            if (e instanceof SyntaxError) {
                logMsg = [`Error parsing ${file}`, e.message].join("\n")
            }
            console.log(chalk.red(logMsg))
        })
    }
})
