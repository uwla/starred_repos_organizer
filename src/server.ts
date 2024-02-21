import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { Data, Item, Service, isItem } from "json-server/lib/service";
import { json } from "milliparsec";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import { Observer } from "json-server/lib/observer";
import { watch } from "chokidar";
import chalk from "chalk";

/* -------------------------------------------------------------------------- */

// Set up database
const file = "user-data.json"; // path relative to CWD of the process
const adapter = new JSONFile(file);
const observer = new Observer(adapter);
const db = new Low(observer, {}) as Low<Data>;
await db.read();
const service = new Service(db);

/* -------------------------------------------------------------------------- */

// Set up http app.
const app = new App();
app.use(json());
app.use(cors());

/* -------------------------------------------------------------------------- */

// Set up routes
const name = "repo";

// Get repos
app.get(`/${name}`, async (req, res) => {
    const queryTypes = ["_start", "_end", "_limit", "_page", "_per_page"];
    const query = Object.fromEntries(
        Object.entries(req.query)
            .map(([key, value]) => {
                if (queryTypes.includes(key) && typeof value === "string") {
                    return [key, parseInt(value)];
                } else {
                    return [key, value];
                }
            })
            .filter(([_key, value]) => !Number.isNaN(value))
    );
    res.send(service.find(name, query));
});

// Get repo
app.get(`/${name}/:id`, (req, res) => {
    const { id = "" } = req.params;
    res.send(service.findById(name, id, req.query) || "Not found");
});

// Create repo(s)
app.post(`/${name}`, async (req, res) => {
    if (!isItem(req.body)) {
        res.send("Expect request body");
        return;
    }
    const data = req.body;
    const repos = [...db.data.repo as Item[]];
    let item;

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
        repos.unshift(...item);
    } else {
        item = assignId(data);
        repos.unshift(item);
    }

    // Extract URLs to detect duplicate repositories.
    const urls = {} as { [key: string]: boolean };
    repos.forEach((r: Item) => (urls[r.html_url as string] = false));

    // Reverse order so the most recently added repos will prevail.
    repos.reverse();

    // Prevent duplicated repos by applying a URL filter.
    db.data.repo = repos.filter((r: Item) => {
        const url = r.html_url as string;
        if (urls[url] == true) return false;
        urls[url] = true;
        return true;
    });

    // Re-reverse to cancel the first reverse.
    db.data.repo.reverse();

    // Write to DB
    await db.write();
    res.send(item);
});

// Update repo
app.post(`/${name}/:id`, async (req, res) => {
    const { id = "" } = req.params;
    if (!isItem(req.body)) {
        res.send("Expected resource");
        return;
    }
    res.send(await service.updateById(name, id, req.body));
});

// Delete repo
app.delete(`/${name}/:id`, async (req, res) => {
    const { id = "" } = req.params;
    res.send(await service.destroyById(name, id, req.query["dependent"]));
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
