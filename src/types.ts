type SelectOption = {
    label: string;
    value: string;
};

type ProviderSlug = "github" | "gitlab" | "gitea" | "codeberg" | "gogs" | "url";

type Topic = string;

type TopicAliases = Record<Topic, Topic>

type Repo = {
    id: string;
    full_name: string;
    name: string;
    description: string;
    topics: Topic[];
    url: string;
    homepage: string;
    lang: string;
    license: string;
    index: number;
    created_at: string;
    last_push: string;
    last_update: string;
    locally_created_at: string;
    locally_updated_at: string;
    forked: boolean;
    forks: number;
    archived: boolean;
    template: boolean;
    owner: string;
    owner_type: string;
    stars: number;
    modified: boolean; // modified locally
    provider: ProviderSlug;
};

type RepoKey = keyof Repo;

interface RepoProvider {
    matchURL: (url: string) => boolean;
    getRepo: (url: string) => Promise<Repo>;
    getUserStarredRepos: (userName: string) => Promise<Repo[]>;
}

type Settings = {
    layout: string;
    size: string;
    sortBy: string;
    theme: string;
    view: string;
    perPage: string;
};

type SettingsKey = keyof Settings;

interface SettingsManager {
    get: (key: SettingsKey) => string;
    set: (key: SettingsKey, value: string) => void;
}

interface StorageDriver {
    fetchRepos: () => Promise<Repo[]>;
    createRepo: (repo: Repo) => Promise<Repo>;
    createMany: (repos: Repo[]) => Promise<Repo[]>;
    updateRepo: (repo: Repo) => Promise<Repo>;
    updateMany: (repos: Repo[]) => Promise<Repo[]>;
    deleteRepo: (repo: Repo) => Promise<boolean>;
    deleteMany: (repos: Repo[]) => Promise<boolean>;

    getAllowedTopics: () => Promise <Topic[]>;
    setAllowedTopics: (topics: Topic[]) => Promise<boolean>;

    getTopicAliases: () => Promise<TopicAliases>;
    setTopicAliases: (aliases: TopicAliases) => Promise<boolean>;
}

type ResponseData = { [key: string]: never };

type ResponseKeyMapper = { [key: string]: RepoKey };

type JsonData = {
    date: string
    repos: Repo[]
    topics_allowed: Topic[]
    topic_aliases: Record<Topic, Topic>
}

interface DisplayProps {
    repos: Repo[];
    onEdit: (repo: Repo) => void;
    onRefresh: (repo: Repo) => void;
    onDelete: (repo: Repo) => void;
    onTopicClicked: (topic: string) => void;
}

interface ViewProps extends DisplayProps {
    topics: string[];
    sortFn: (a: Repo, b: Repo) => number;
    Display: (props: DisplayProps) => JSX.Element;
}

const NoTopicsType = "~~ none ~~";

export type {
    ViewProps,
    DisplayProps,
    JsonData,
    StorageDriver,
    SelectOption,
    Settings,
    SettingsKey,
    SettingsManager,
    Repo,
    RepoKey,
    RepoProvider,
    ResponseData,
    ResponseKeyMapper,
    ProviderSlug as ProviderSlugs,
    Topic,
    TopicAliases
};

export { NoTopicsType };
