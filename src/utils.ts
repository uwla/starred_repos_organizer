import {
    NoTopicsType,
    Repo,
    RepoKey,
    SelectOption,
    Topic,
    TopicAliases,
} from "./types"

const optionsToTopics = (topics: SelectOption[]): string[] =>
    topics.map((topic: SelectOption) => topic.value)

const topicsToOptions = (topics: string[]): SelectOption[] =>
    topics.map((topic: string) => ({ value: topic, label: topic }))

const extractTopics = (repos: Repo[]): string[] => {
    let topics = repos.map((item: Repo) => item.topics).flat()
    topics = [...new Set(topics)]
    topics.sort()
    return topics
}

const uniqueRepos = (repos: Repo[]): Repo[] => {
    const unique = [] as Repo[]
    const urls = {} as { [key: string]: number }

    // Prevent duplicated repos by applying a URL filter.
    repos.forEach((r: Repo) => {
        const url = r.url
        if (urls[url] === undefined) {
            urls[url] = unique.length
            unique.push(r)
            return
        }
        const ind = urls[url]

        // preserve locally modified attributes
        if (unique[ind].modified) {
            r.topics = unique[ind].topics
            r.id = unique[ind].id
        }
        unique[ind] = r
    })

    return unique
}

const randomId = () => Math.random().toString().slice(2, 12)

const now = () => new Date().toISOString()

const assignId = (repo: Repo) => ({ ...repo, id: repo.id || randomId() })

const assignTimestamp = (repo: Repo) => ({
    ...repo,
    locally_created_at: repo.locally_created_at || now(),
    locally_updated_at: now(),
})

const extractDomain = (url: string) =>
    url.replace(/(https?:\/\/)?([\w\d.]+\.[\w\d]+)\/?.*/, "$2")

const addRepo = (repos: Repo[], repo: Repo) =>
    uniqueRepos([...repos, assignTimestamp(assignId(repo))])

const addRepos = (repos: Repo[], reposToAdd: Repo[]) =>
    uniqueRepos([...repos, ...reposToAdd])

const updateRepo = (repos: Repo[], repo: Repo) => {
    const index = repos.findIndex((r: Repo) => r.id === repo.id)
    if (index === -1) {
        throw new Error(`[UTILS] repository ${repo.url} does not exist`)
    }
    repos.splice(index, 1, assignTimestamp(repo))
    return uniqueRepos(repos)
}

const updateRepos = (repos: Repo[], reposToUpdate: Repo[]) => {
    const id2repo = {} as { [key: string]: Repo }

    reposToUpdate.forEach((r: Repo) => {
        id2repo[r.id] = r
    })

    repos.forEach((repo: Repo, index: number) => {
        const { id } = repo
        if (id2repo[id] !== undefined) {
            repos[index] = assignTimestamp(id2repo[id])
        }
    })

    return uniqueRepos(repos)
}

const delRepo = (repos: Repo[], repo: Repo | string) => {
    const id = typeof repo === "string" ? (repo as string) : (repo as Repo).id
    return repos.filter((r: Repo) => r.id !== id)
}

const delRepos = (repos: Repo[], reposToDel: Repo[] | string[]) => {
    if (reposToDel.length < 0) return repos
    const ids = {} as { [key: string]: boolean }
    const idsToDel =
        typeof reposToDel[0] === "string"
            ? (reposToDel as string[])
            : (reposToDel as Repo[]).map(r => r.id)
    idsToDel.forEach((id: string) => (ids[id] = true))
    return repos.filter((r: Repo) => !ids[r.id])
}

/* -------------------------------------------------------------------------- */
// filter
function repoHasText(repo: Repo, normalizedQuery: string) {
    const searchableKeys = [
        "full_name",
        "description",
        "topics",
        "lang",
    ] as RepoKey[]

    for (const key of searchableKeys) {
        const field = repo[key]
        let hasMatch = false

        // Search string field by checking if the value includes the query.
        if (typeof field === "string") {
            hasMatch = field.toLowerCase().includes(normalizedQuery)
        }

        // Search array field by checking if any value includes the query.
        if (Array.isArray(field)) {
            hasMatch = field.some((val: string) =>
                val.toLowerCase().includes(normalizedQuery)
            )
        }

        if (hasMatch) return true
    }
    return false
}

function filterByText(repos: Repo[], search: string) {
    if (search == "") return repos
    const normalizedQuery = search.toLowerCase()
    return repos.filter((repo: Repo) => repoHasText(repo, normalizedQuery))
}

function filterByTopics(repos: Repo[], topics: string[]) {
    if (topics.length == 0) return repos

    // whether we want repos without topics
    const emptyTopics = topics.includes(NoTopicsType)

    return repos.filter((repo: Repo) => {
        // if we want empty topics, filter the repo which has no topic
        if (emptyTopics && repo.topics.length === 0) {
            return true
        }

        return topics.some((topic: string) => repo.topics.includes(topic))
    })
}

function applySearchFilters(repos: Repo[], search: string, topics: string[]) {
    return filterByTopics(filterByText(repos, search), topics)
}

function removeNonAllowedTopics(repos: Repo[], allowedTopics: string[]) {
    const topicsDict: Record<string, boolean> = {}
    allowedTopics.forEach((t: string) => (topicsDict[t] = true))
    const filterTopics = (topic: string) => topicsDict[topic]
    repos.forEach((r: Repo) => {
        const newTopics = r.topics.filter(filterTopics)
        if (newTopics.length !== r.topics.length) {
            r.topics = newTopics
            r.modified = true
        }
    })
    return repos
}

function mapTopicsToAliases(repos: Repo[], aliases: TopicAliases) {
    return repos.map(repo => {
        // create a copy
        const copy = { ...repo }
        if (!copy.topics) {
            return copy
        }

        // map the topics to their aliases
        copy.topics = [...repo.topics]
        for (const index in copy.topics) {
            const topic = copy.topics[index]
            if (aliases[topic] !== undefined) {
                copy.topics[index] = aliases[topic]
            }
        }
        copy.topics = [...new Set(copy.topics)]
        return copy
    })
}

function enforceTopicRestrictions(
    repos: Repo[],
    allowedTopics: Topic[],
    aliases: TopicAliases
) {
    const emptyAliases = Object.keys(aliases).length === 0
    const emptyTopics = allowedTopics.length === 0

    if (emptyAliases && emptyTopics) {
        return repos
    }

    if (emptyAliases) {
        return removeNonAllowedTopics(repos, allowedTopics)
    }

    if (emptyTopics) {
        return mapTopicsToAliases(repos, aliases)
    }

    return removeNonAllowedTopics(
        mapTopicsToAliases(repos, aliases),
        allowedTopics
    )
}

export {
    addRepo,
    addRepos,
    applySearchFilters,
    assignId,
    assignTimestamp,
    delRepo,
    delRepos,
    extractDomain,
    extractTopics,
    enforceTopicRestrictions,
    removeNonAllowedTopics,
    now,
    optionsToTopics,
    randomId,
    topicsToOptions,
    uniqueRepos,
    updateRepo,
    updateRepos,
}
