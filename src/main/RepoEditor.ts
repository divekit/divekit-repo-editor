import dotenv from 'dotenv'
import {GitLabRepositoryManager} from './repository_manager/GitLabRepositoryManager'
import * as editorConfig from './config/editorConfig.json'
import {AssetManager} from './asset_manager/AssetManager'
import {logger} from './util/Logger'

export class RepoEditor {
    private repositoryManager = new GitLabRepositoryManager()
    private assetManager: AssetManager

    constructor(assetManger: AssetManager) {
        this.assetManager = assetManger
    }

    async validateConfig() {
        logger.info('Load config...')

        const result = dotenv.config()
        if (result.error) {
            throw new Error('Error while loading environment: ' + result.error)
        }

        if (editorConfig.onlyUpdateCodeProjects && editorConfig.onlyUpdateTestProjects) {
            throw new Error('Invalid Config: Only one flag of "onlyUpdateCodeProjects" and "onlyUpdateTestProjects" can be true')
        }

        logger.info('Load loaded')
    }

    async execute() {
        logger.info('Start repo-editor')

        await this.assetManager.updateAssets()
        const assets = this.assetManager.getAssets()

        await this.repositoryManager.processEdits(assets) // .then(r => console.info("Addition-Results: " + r))
    }
}
