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

export type { SelectOption, Repo, RepoKey, RepoProvider };
