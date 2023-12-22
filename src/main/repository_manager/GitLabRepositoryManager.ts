import {Gitlab, ProjectSchema} from 'gitlab'
import * as config from '../config/editorConfig.json'
import dotenv from 'dotenv'
import {logger} from '../util/Logger'
import fs from 'fs'
import {Asset} from '../asset_manager/Asset'

dotenv.config()
const gitlab = new Gitlab({
    host: process.env.HOST,
    token: process.env.API_TOKEN,
})

// Get main branch name from environment variable or default to "master"
const mainBranch = process.env.DIVEKIT_MAINBRANCH_NAME || 'master'

const encoding = "base64"

/**
 * Process all configured edits.
 * <br>
 * Configuration is done via **src/main/config/*** and the file structure under **assets/**.
 */
export class GitLabRepositoryManager {
    // All config used from GitLabRepositoryManager
    private static readonly TEST_GROUP_FLAG: string = 'tests_group'
    private static readonly COMMIT_MSG: string = config.commitMsg
    private static readonly FILE_EXISTS_ERROR: string = 'A file with this name already exists'

    /**
     * Get all projects inside multiple groups according to the config
     * <br>
     * _Used Config:
     * groupIds and onlyUpdateTestProjects+onlyUpdateCodeProjects flags._
     */
    private static async getAllProjects(): Promise<ProjectSchema[]> {
        let projects: ProjectSchema[] = []
        const groupNames = (await gitlab.Groups.all())
            .filter(it => config.groupIds.includes(it.id))
            .map(groupSchema => groupSchema.full_path)
        logger.info('loaded groups: ' + groupNames)

        if (!groupNames.length || groupNames.length !== config.groupIds.length) {
            const missing = config.groupIds.length - groupNames.length
            logger.error('Exit. Could not find all groups. Missing ' + missing + ' of ' + config.groupIds.length)
            return []
        }

        for (const groupId of config.groupIds) {
            const projectsOfGroup = await gitlab.GroupProjects.all(groupId)
            projects = projects.concat(projectsOfGroup)
        }

        const filterName = (name: string) => {
            if (config.onlyUpdateTestProjects) return name.includes(GitLabRepositoryManager.TEST_GROUP_FLAG)
            if (config.onlyUpdateCodeProjects) return !name.includes(GitLabRepositoryManager.TEST_GROUP_FLAG)
            return true
        }

        return projects.filter(it => filterName(it.name))
    }

    private static readFileContent(path: string) {
        return fs.readFileSync(path).toString(encoding)
    }

    private static createCommitAction(asset: Asset, action: CommitActionType): any {
        return {
            action: action.valueOf(),
            filePath: asset.gitFilePath,
            content: GitLabRepositoryManager.readFileContent(asset.localFilePath),
            encoding: encoding
        }
    }

    /**
     * iterate over the configured projects and update the repositories
     * according to the structure provided in **assets/**.
     * <br>
     * _Note: all changes are overwritten_
     */
    async processEdits(assets: Asset[]): Promise<void> {
        const projects: ProjectSchema[] = await GitLabRepositoryManager.getAllProjects()

        if (projects.length < 1) {
            logger.warn('can\'t find any projects')
            return
        }
        logger.info('files staged for commit: ' + assets.map(it => it.projectName + '/' + it.gitFilePath).join(', '))

        for(const project of projects) {
            // only update generic and project specific changes
            const filteredAssets = assets.filter(asset => !asset.projectName || asset.projectName === project.name)
            await this.forceEdit(project, filteredAssets)
                    .catch(reason => logger.error('could not force edit. Reason: ' + JSON.stringify(reason)))
        }
    }

    /**
     * Force file creation -> try to create and then update
     */
    private async forceEdit(project: ProjectSchema, assets: Asset[]) {
        const commitActions: any[] = assets.map(it => GitLabRepositoryManager.createCommitAction(it, CommitActionType.CREATE))

        for (const commitAction of commitActions) {
            logger.debug('send create for ' + project.name + '/' + commitAction.filePath)
            try {
                const promise = gitlab.Commits.create(
                    project.id,
                    mainBranch,
                    GitLabRepositoryManager.COMMIT_MSG + ' [create]',
                    [commitAction]
                )
                await promise.then(_ => logger.info('CREATED ' + project.name + '/' + commitAction.filePath))
            } catch (e) {
                if (e.description !== GitLabRepositoryManager.FILE_EXISTS_ERROR) {
                    logger.error('Error while creating: ' + project.name + '/' + commitAction.filePath + ': ' + JSON.stringify(e))
                }

                commitAction.action = CommitActionType.UPDATE.valueOf()
                await this.sendUpdateAction(project, commitAction)
            }
        }
    }

    private async sendUpdateAction(project: ProjectSchema, commitAction: any) {
        logger.debug('send update: ' + project.name + '/' + commitAction.filePath)
        try {
            const promise = gitlab.Commits.create(
                project.id,
                mainBranch,
                GitLabRepositoryManager.COMMIT_MSG + ' [update]',
                [commitAction]
            )

            await promise.then(_ => logger.info('UPDATED ' + project.name + '/' + commitAction.filePath))
        } catch (e) {
            logger.error('Error while updating: ' + project.name + '/' + commitAction.filePath + ' - ' + JSON.stringify(e))
        }
    }
}
