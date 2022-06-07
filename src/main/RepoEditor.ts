import dotenv from "dotenv"
import {GitLabRepositoryManager} from "./repository_manager/GitLabRepositoryManager"
import * as editorConfig from "./config/editorConfig.json"
import {AssetManager} from "./util/AssetManager";
import {logger} from "./util/Logger";

export class RepoEditor {
    private repositoryManager = new GitLabRepositoryManager()

    async validateConfig() {
        logger.info("Load config...")

        const result = dotenv.config()
        if (result.error) {
            logger.error("Error while loading environment: " + result.error)
            process.exit(500) // TODO read about node error codes
        }

        if (editorConfig.onlyUpdateCodeProjects && editorConfig.onlyUpdateTestProjects) {
            logger.error("Invalid Config: Only one flag of 'onlyUpdateCodeProjects' and 'onlyUpdateTestProjects' can be true")
            process.exit(500) // TODO read about node error codes
        }

        // TODO add and validate variant config
    }

    async execute() {
        logger.info("Start repo-editor")

        if (editorConfig.testRun) {
            logger.info("This is a test run")
            // TODO implement usage e.g. do everything but don't push
            return
        }

        const assetManager = new AssetManager()
        await assetManager.updateAssets()
        const assets = assetManager.getAssets()

        await this.repositoryManager.processEdits(assets)//.then(r => console.info("Addition-Results: " + r))
    }
}