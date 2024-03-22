import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { Data, isItem } from "json-server/lib/service";
import { json } from "milliparsec";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { Observer } from "json-server/lib/observer";
import { watch } from "chokidar";
import chalk from "chalk";
import {
    addRepo,
    addRepos,
    delRepo,
    delRepos,
    updateRepo,
    updateRepos,
} from "./utils";
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
        db.data.repo = delRepos(repos, ids);
        db.write();
        const success = repos.length - ids.length === db.data.repo.length;
        res.send({ success });
        return;
    }

    if (method === "put") {
        db.data.repo = updateRepos(repos, data.repos as Repo[]);
        db.write();
        res.send(data.repos);
        return;
    }

    // create one or many items at once.
    if (Array.isArray(data)) {
        db.data.repo = addRepos(repos, data as Repo[]);
    } else {
        db.data.repo = addRepo(repos, data as Repo);
    }

    // Write to DB
    await db.write();
    res.send(item);
});

// Update repo
app.post(`/repo/:id`, async (req, res) => {
    if (!isItem(req.body)) {
        res.send("Expected resource");
        return;
    }
    db.data.repo = updateRepo(dbRepos(), req.body as Repo);
    db.write();
    res.send(req.body);
});

// Delete single repo.
app.delete(`/repo/:id`, async (req, res) => {
    const { id = "" } = req.params;
    const repos = dbRepos();
    db.data.repo = delRepo(repos, id);
    db.write();
    const success = repos.length - 1 === db.data.repo.length;
    res.send({ success });
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
