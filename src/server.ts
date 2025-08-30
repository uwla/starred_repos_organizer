import { App } from "@tinyhttp/app"
import { cors } from "@tinyhttp/cors"
import { Data } from "json-server/lib/service"
import { json } from "milliparsec"
import { JSONFile } from "lowdb/node"
import { Low } from "lowdb"
import { Observer } from "json-server/lib/observer"
import { watch } from "chokidar"
import chalk from "chalk"
import {
    addRepo,
    addRepos,
    delRepo,
    delRepos,
    updateRepo,
    updateRepos,
} from "./utils"
import { Repo } from "./types"
import repoProvider from "./repo"

/* -------------------------------------------------------------------------- */
// Set up database

const file = "user-data.json" // path relative to CWD of the process
const adapter = new JSONFile(file)
const observer = new Observer(adapter)
const db = new Low(observer, {}) as Low<Data>
await db.read()

/* -------------------------------------------------------------------------- */
// Database helpers

const dbRepos = () => db.data.repo as Repo[]
const findRepo = (id: string) => dbRepos().find((r: Repo) => r.id === id)

/* -------------------------------------------------------------------------- */
// Set up http app.

const app = new App()
app.use(json())
app.use(cors())

/* -------------------------------------------------------------------------- */
// Set up routes

// Get repos
app.get("/repo", async (_request, response) => {
    response.send(dbRepos())
})

// Get repo
app.get("/repo/:id", (request, response) => {
    const { id = "" } = request.params
    response.send(findRepo(id))
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
    db.data.repo = addRepo(dbRepos(), repo as Repo)
    await db.write()
    response.send(repo)
})

// Update single repository
app.post("/repo/:id", async (request, response) => {
    db.data.repo = updateRepo(dbRepos(), request.body as Repo)
    await db.write()
    response.send(request.body)
})

// Delete single repository
app.delete("/repo/:id", async (request, response) => {
    const { id = "" } = request.params
    const repos = dbRepos()
    db.data.repo = delRepo(repos, id)
    db.write()
    const success = repos.length - 1 === db.data.repo.length
    response.send({ success })
})

// Create many repositories
app.post("/repos", async (request, response) => {
    const data = request.body
    const repos = dbRepos()
    db.data.repo = addRepos(repos, data as Repo[])
    await db.write()
    response.send(db.data.repo)
})

// Update many repositories
app.put("/repos", async (request, response) => {
    const data = request.body
    const repos = dbRepos()
    db.data.repo = updateRepos(repos, data as Repo[])
    await db.write()
    response.send(db.data.repo)
})

// Delete multiple repositories
app.patch("/repos", async (request, response) => {
    const { ids } = request.body
    const repos = dbRepos()
    db.data.repo = delRepos(repos, ids)
    await db.write()
    const success = repos.length - ids.length === db.data.repo.length
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
    db.write()
    response.send(db.data["topics_allowed"])
})

// Set topic aliases
app.post("/topics/aliases", async (request, response) => {
    db.data["topic_aliases"] = request.body.topics
    db.write()
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
