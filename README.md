# REPO STARS ORGANIZER

Organizer your starred repositories from various sources.

A live working demo is available at <https://uwla.github.io/repo_stars_organizer>.

## Features

- Starred repositories from GitHub and GitLab (support for Gitea, SourceHut, etc, coming soon).
- Import starred repositories from any public user profile.
- No account needed, save starred repositories locally.
- Modify repository topics by adding new ones or deleting existing.
- More privacy by not exposing your interests to the internet.
- Works offline (except for adding repositories because needs to fetch data).
- Search filter and topic filter.

## Usage

Go to the demo page and use the app.

You can also save the demo files locally and it will work offline.

### Development

1. Clone the repo and `cd` into:

    ```shell
    git clone https://github.com/uwla/repo_stars_organizer && cd repo_stars_organizer
    ```

2. Install dependencies:

    ```shell
    npm install
    ```

3. Copy the local sample file `user-data-sample.json` to `user-data.json`:

    ```shell
    cp user-data-sample.json user-data.json
    ```

    This is where the data will be stored.

4. Launch the app:

    ```shell
    npm run dev
    ```

    Alternatively, you can build the app and launch two different serves, an
    API server, and a server for the website:

    ```shell
    npm run build
    python -m http.server -d dist/ & # launch http server on background
    npm run server-api # start api server
    ```

## Roadmap

- [x] Search filter
- [x] Topics filter
- [x] Sort repos by name or stars
- [x] Import all starred repos from public profiles
- [x] Manual selection when importing repos in batch
- [x] Display forks, code language, and other details
- [x] Import data from file
- [x] Export data to file
- [x] Export only filtered entries
- [x] Option to delete all repos
- [x] Option to delete filtered repos
- [ ] Show notifications on success
- [x] Support for GitHub
- [x] Support for GitLab
- [ ] Support for CodeBerg
- [ ] Support for Gitea
- [ ] Support for SourceHut
- [ ] Support for SourceForge

## Contributing

Contributions are welcome.

## License

MIT.
