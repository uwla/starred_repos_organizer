import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { Data, Item, isItem } from "json-server/lib/service";
import { json } from "milliparsec";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { Observer } from "json-server/lib/observer";
import { watch } from "chokidar";
import chalk from "chalk";
import { uniqueRepos } from "./utils";
import { Repo } from "./types";

/* -------------------------------------------------------------------------- */

// Set up database
const file = "user-data.json"; // path relative to CWD of the process
const adapter = new JSONFile(file);
const observer = new Observer(adapter);
const db = new Low(observer, {}) as Low<Data>;
await db.read();

/* -------------------------------------------------------------------------- */

// Database helpers
const dbRepos = () => db.data.repo as Repo[];
const findRepo = (id: string) => dbRepos().find((r: Repo) => r.id === id);
const findRepoIndex = (id: string) =>
    dbRepos().findIndex((r: Repo) => r.id === id);

/* -------------------------------------------------------------------------- */

// Set up http app.
const app = new App();
app.use(json());
app.use(cors());

/* -------------------------------------------------------------------------- */

// Set up routes

// Get repos
app.get(`/repo`, async (_, res) => {
    res.send(dbRepos());
});

// Get repo
app.get(`/repo/:id`, (req, res) => {
    const { id = "" } = req.params;
    res.send(findRepo(id));
});

// Create repo(s)
app.post(`/repo`, async (req, res) => {
    if (!isItem(req.body)) {
        res.send("Expect request body");
        return;
    }

    const data = req.body;
    const repos = dbRepos();
    let item;

    // The actual method (POST, PUT, DELETE)
    const method = ((data._method as string) || "").toLowerCase();

    // Delete many repositories.
    if (method === "delete") {
        const ids = data.ids as string[];
        const repos = dbRepos();
        const toDel = {} as { [key: string]: boolean };
        ids.forEach((id: string) => (toDel[id] = true));
        const newRepos = repos.filter((r: Repo) => !toDel[r.id]);
        const deleted = repos.filter((r: Repo) => toDel[r.id]);
        db.data.repo = newRepos;
        db.write();
        res.send(deleted);
        return;
    }

    if (method === "put") {
        const toUpdate = data.repos as Repo[];
        const id2repo = {} as { [key: string]: Repo };
        toUpdate.forEach((r: Repo) => (id2repo[r.id] = r));
        repos.forEach((repo: Repo, index: number) => {
            const id = repo.id;
            if (id2repo[id] !== undefined) {
                repos[index] = id2repo[id];
            }
        });
        db.data.repo = repos;
        db.write();
        res.send(toUpdate);
        return;
    }

    // helper to assign random ID to created items.
    const randomId = () => Math.random().toString().slice(2, 8);
    const assignId = (item: Item) => ({ ...item, id: randomId() });

    // create one or many items at once.
    if (Array.isArray(data)) {
        item = [] as Item[];
        while (data[item.length] != null) {
            item.push(data[item.length] as Item);
        }
        item = item.map(assignId);
        repos.unshift(...(item as Repo[]));
    } else {
        item = assignId(data);
        repos.unshift(item as Repo);
    }

    // Make it unique.
    db.data.repo = uniqueRepos(repos as Repo[]);

    // Write to DB
    await db.write();
    res.send(item);
});

// Update repo
app.post(`/repo/:id`, async (req, res) => {
    const { id = "" } = req.params;
    if (!isItem(req.body)) {
        res.send("Expected resource");
        return;
    }
    const repo = req.body as Repo;
    const repos = dbRepos();
    const index = findRepoIndex(id);
    repos.splice(index, 1, repo);
    db.data.repo = repos;
    db.write();
    res.send(repo);
});

// Delete single repo.
app.delete(`/repo/:id`, async (req, res) => {
    const { id = "" } = req.params;
    const repos = dbRepos();
    const index = findRepoIndex(id);
    const repo = repos[index];
    repos.splice(index, 1);
    db.data.repo = repos;
    db.write();
    res.send(repo);
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(
        [
            chalk.bold(`JSON Server started on PORT :${port}`),
            chalk.gray("Press CTRL-C to stop"),
            chalk.gray(`Watching ${file}...`),
            "",
            chalk.bold("Index:"),
            chalk.gray(`http://localhost:${port}/`),
            "",
        ].join("\n")
    );
});

/* -------------------------------------------------------------------------- */

let writing = false; // true if the file is being written to by the app
let prevEndpoints = "";
observer.onWriteStart = () => {
    writing = true;
};
observer.onWriteEnd = () => {
    writing = false;
};
observer.onReadStart = () => {
    prevEndpoints = JSON.stringify(Object.keys(db.data).sort());
};
observer.onReadEnd = (data: unknown) => {
    if (data === null) {
        return;
    }
    const nextEndpoints = JSON.stringify(Object.keys(data as Data).sort());
    if (prevEndpoints !== nextEndpoints) {
        console.log();
    }
};

watch(file).on("change", () => {
    // Do no reload if the file is being written to by the app
    if (!writing) {
        db.read().catch((e) => {
            let logMsg = e;
            if (e instanceof SyntaxError) {
                logMsg = [`Error parsing ${file}`, e.message].join("\n");
            }
            console.log(chalk.red(logMsg));
        });
    }
});
