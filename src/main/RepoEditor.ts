import dotenv from "dotenv"
import {GitLabRepositoryManager} from "./repository_manager/GitLabRepositoryManager"
import * as editorConfig from "./config/editorConfig.json"

export class RepoEditor {
    private repositoryManager = new GitLabRepositoryManager()

    async validateConfig() {
        console.info("Load config...")

        const result = dotenv.config()
        if (result.error) {
            console.error("Error while loading environment: " + result.error)
            process.exit(500) // TODO read about node error codes
        }

        if (editorConfig.onlyUpdateCodeProjects && editorConfig.onlyUpdateTestProjects) {
            console.error("Invalid Config: Only one flag of 'onlyUpdateCodeProjects' and 'onlyUpdateTestProjects' can be true")
            process.exit(500) // TODO read about node error codes
        }

        // TODO add and validate variant config
    }

    async execute() {
        console.info("Start repo-editor")

        if (editorConfig.testRun) {
            console.info("This is a test run")
            // TODO implement usage e.g. do everything but don't push
            return
        }

        await this.repositoryManager.processEdits()//.then(r => console.info("Addition-Results: " + r))
    }
}