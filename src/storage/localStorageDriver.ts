import type { StorageDriver, Repo, Topic, TopicAliases } from "../types"
import {
    addRepo,
    addRepos,
    assignId,
    delRepo,
    delRepos,
    updateRepo,
    updateRepos,
    keepOnlyRepoTopics,
} from "../utils"
import sampleData from "../../user-data-sample.json"

const getAllowedTopics = () => {
    return JSON.parse(localStorage.getItem("allowed_topics") || "[]")
}

const getTopicAliases = () => {
    return JSON.parse(localStorage.getItem("topic_aliases") || "{}")
}

const setAllowedTopics = (topics: Topic[]) => {
    localStorage.setItem("allowed_topics", JSON.stringify(topics))
}

const setTopicAliases = (aliases: TopicAliases) => {
    localStorage.setItem("topic_aliases", JSON.stringify(aliases))
}

const filterRepoTopics = (repos: Repo[]) => {
    const allowedTopics = getAllowedTopics()
    const aliases = getTopicAliases()
    const emptyAliases = Object.keys(aliases).length === 0

    const reposFiltered = emptyAliases
        ? repos
        : repos.map(repo => {
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

    if (allowedTopics.length == 0) {
        return reposFiltered
    }

    return keepOnlyRepoTopics(reposFiltered, allowedTopics)
}

const getRepos = () =>
    JSON.parse(localStorage.getItem("repos") || "[]") as Repo[]

const setRepos = (repos: Repo[]) => {
    const filteredRepos = filterRepoTopics(repos)
    localStorage.setItem("repos", JSON.stringify(filteredRepos))
}

const isDemo = process.env.NODE_ENV === "demo"
let firstTimeAccess = localStorage.getItem("repos") === null

const localStorageDriver: StorageDriver = {
    async fetchRepos() {
        // DEMO MODE: load sample data for demo app.
        if (isDemo && firstTimeAccess) {
            setRepos(sampleData.repo as Repo[])
            firstTimeAccess = false
        }
        return getRepos()
    },
    async createRepo(repo: Repo) {
        const created = assignId(repo)
        const id = created.id
        setRepos(addRepo(getRepos(), created))

        return getRepos().find(repo => repo.id === id) as Repo
    },
    async createMany(repos: Repo[]) {
        const created = repos.map(assignId)
        const ids = created.map(r => r.id)
        setRepos(addRepos(getRepos(), created))

        return getRepos().filter(r => ids.includes(r.id))
    },
    async updateRepo(repo: Repo) {
        const id = repo.id
        setRepos(updateRepo(getRepos(), repo))

        return getRepos().find(r => r.id === id) as Repo
    },
    async updateMany(repos: Repo[]) {
        const ids = repos.map(r => r.id)
        setRepos(updateRepos(getRepos(), repos))

        return getRepos().filter(r => ids.includes(r.id))
    },
    async deleteRepo(repo: Repo) {
        const oldRepos = getRepos()
        const newRepos = delRepo(oldRepos, repo)
        setRepos(newRepos)
        return oldRepos.length > newRepos.length
    },
    async deleteMany(repos: Repo[]) {
        const oldRepos = getRepos()
        const newRepos = delRepos(oldRepos, repos)
        setRepos(newRepos)
        return oldRepos.length > newRepos.length
    },
    async getAllowedTopics() {
        return getAllowedTopics()
    },
    async setAllowedTopics(topics: string[]) {
        setAllowedTopics(topics)
        return true
    },
    async setTopicAliases(aliases: TopicAliases) {
        setTopicAliases(aliases)
        return true
    },
    async getTopicAliases() {
        return getTopicAliases()
    },
}

export default localStorageDriver
