type SelectOption = {
    label: string;
    value: string;
};

type Repo = {
    id?: string;
    full_name: string;
    name: string;
    description: string;
    topics: Array<string>;
    html_url: string;
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
    stars: number;
};

type RepoKey = keyof Repo;

interface RepoProvider {
    getRepo: (url: string) => Promise<Repo>;
    getReposFromUser: (userName: string) => Promise<Repo[]>;
}

interface ApiClient {
    fetchRepos: () => Promise<Repo[]>;
    createRepo: (repo: Repo) => Promise<Repo>;
    createMany: (repos: Repo[]) => Promise<Repo[]>;
    updateRepo: (repo: Repo) => Promise<Repo>;
    deleteRepo: (repo: Repo) => Promise<boolean>;
}

type ResponseData = { [key: string]: never };

type ResponseKeyMapper = { [key: string]: RepoKey };

export type {
    ApiClient,
    SelectOption,
    Repo,
    RepoKey,
    RepoProvider,
    ResponseData,
    ResponseKeyMapper,
};
