type SelectOption = {
    label: string;
    value: string;
};

type ProviderSlug =
    | "github"
    | "gitlab"
    | "gitea"
    | "codeberg"
    | "gogs"
    | "url";

type Repo = {
    id: string;
    full_name: string;
    name: string;
    description: string;
    topics: Array<string>;
    url: string;
    homepage: string;
    lang: string;
    license: string;
    index: number;
    created_at: string;
    last_push: string;
    last_update: string;
    forked: boolean;
    forks: number;
    archived: boolean;
    template: boolean;
    owner: string;
    owner_type: string;
    provider: ProviderSlug; // github, gitlab, gitea, ...
    stars: number;
};

type RepoKey = keyof Repo;

interface RepoProvider {
    matchURL: (url: string) => boolean;
    getRepo: (url: string) => Promise<Repo>;
    getUserStarredRepos: (userName: string) => Promise<Repo[]>;
}

interface StorageDriver {
    fetchRepos: () => Promise<Repo[]>;
    createRepo: (repo: Repo) => Promise<Repo>;
    createMany: (repos: Repo[]) => Promise<Repo[]>;
    updateRepo: (repo: Repo) => Promise<Repo>;
    updateMany: (repos: Repo[]) => Promise<Repo[]>;
    deleteRepo: (repo: Repo) => Promise<boolean>;
    deleteMany: (repos: Repo[]) => Promise<boolean>;
}

type ResponseData = { [key: string]: never };

type ResponseKeyMapper = { [key: string]: RepoKey };

export type {
    StorageDriver,
    SelectOption,
    Repo,
    RepoKey,
    RepoProvider,
    ResponseData,
    ResponseKeyMapper,
    ProviderSlug as ProviderSlugs,
};
