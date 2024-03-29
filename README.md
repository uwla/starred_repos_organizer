# STARRED REPOS ORGANIZER

Organizer your starred repositories from various sources.

A live working demo is available at <https://uwla.github.io/starred_repos_organizer>.

## Features

- Star repositories from GitHub, GitLab, Codeberg, self-hosted Gitlab instance,
  self-hosted Gitea instance, and more coming soon.
- No account needed, save starred repositories locally.
- Import starred repositories from any public user profile on Github or Gitlab.
- Import repositories from JSON file.
- Export repositories to JSON file.
- Export filtered results only to JSON file.
- Modify repository topics by adding new ones or deleting existing.
- More privacy by not exposing your interests to the internet.
- Works offline (except when fetching remote data).
- Sort by name, stars or forks.
- Text search and topic filter.
- Pagination.

## Usage

Go to the demo page and use the app.

You can also download the webpage using a modern browser, such as Chrome and
Firefox, and then open the files locally.

Lastly, you can follow the development instructions to launch a local
development server or build the files locally.

## Development

1. Clone the repo and `cd` into it:

    ```shell
    git clone https://github.com/uwla/starred_repos_organizer && cd starred_repos_organizer
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

4. Run the scripts:

    To start development server using localStorage for storage:

    ```shell
    npm run dev
    ```

    To start development server using an REST server for storage:

    ```shell
    npm run dev:rest
    ```

    To build the demo app:

    ```shell
    npm run build
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
- [x] Show notifications on success
- [x] Manage topics globally
- [x] Support for GitHub
- [x] Support for GitLab
- [x] Support for CodeBerg
- [x] Support for self-hosted GitLab instance
- [x] Support for self-hosted Gitea instance
- [ ] Support for self-hosted Gogs instance
- [x] Option to specify provider type
- [ ] Option to set auth tokens

## Contributing

Contributions are welcome.

## Credits

Thanks [Keziah Moselle](https://github.com/KeziahMoselle) for the original
inspiration from his project [export-github-stars](https://github.com/KeziahMoselle/export-github-stars).

## License

MIT.
