import sampleData from "../../user-data-sample.json"
import type { Repo, StorageDriver, Topic, TopicAliases } from "../types"
import {
    addRepo,
    addRepos,
    assignId,
    delRepo,
    delRepos,
    enforceTopicRestrictions,
    updateRepo,
    updateRepos,
} from "../utils"

function getAllowedTopics(): Topic[] {
    return JSON.parse(localStorage.getItem("allowed_topics") || "[]")
}

function getTopicAliases(): TopicAliases {
    return JSON.parse(localStorage.getItem("topic_aliases") || "{}")
}

const setAllowedTopics = (topics: Topic[]) => {
    localStorage.setItem("allowed_topics", JSON.stringify(topics))
}

const setTopicAliases = (aliases: TopicAliases) => {
    localStorage.setItem("topic_aliases", JSON.stringify(aliases))
}

const getRepos = () =>
    JSON.parse(localStorage.getItem("repos") || "[]") as Repo[]

const setRepos = (repos: Repo[]) => {
    const filteredRepos = enforceTopicRestrictions(
        repos,
        getAllowedTopics(),
        getTopicAliases()
    )
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
