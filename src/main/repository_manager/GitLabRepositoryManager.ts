import {Gitlab, ProjectSchema} from 'gitlab'
import * as config from '../config/editorConfig.json'
import dotenv from 'dotenv'
import {logger} from '../util/Logger'
import fs from 'fs'

dotenv.config()
const gitlab = new Gitlab({
    host: process.env.HOST,
    token: process.env.API_TOKEN,
})

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
            .map(g => g.full_path)
        logger.info('loaded groups: ' + groupNames)

        if (!groupNames.length || groupNames.length !== config.groupIds.length) {
            const missing = config.groupIds.length - groupNames.length
            logger.warn('Exit. Could not find all groups. Missing ' + missing + ' of ' + config.groupIds)
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

    /**
     * Remove the path prefix from the directory structure
     * e.g. remove `assets/` from `assets/README.md`
     */
    private static removePrefix(path: string, prefix: string = 'assets/'): string {
        return path.replace(prefix, '')
    }

    private static readFileContent(path: string) {
        return fs.readFileSync(path).toString()
    }

    private static createCommitAction(path: string, action: CommitActionType): any {
        return {
            action: action.valueOf(),
            filePath: GitLabRepositoryManager.removePrefix(path),
            content: GitLabRepositoryManager.readFileContent(path)
        }
    }

    /**
     * iterate over the configured projects and update the repositories
     * according to the structure provided in **assets/**.
     * <br>
     * _Note: all changes are overwritten_
     */
    async processEdits(paths: string[]): Promise<void> {
        const projects: ProjectSchema[] = await GitLabRepositoryManager.getAllProjects()

        if (projects.length < 1) {
            logger.warn('can\'t find any projects')
            return
        }
        logger.info('files staged for commit: ' + paths)

        projects.forEach(it => {
            this.forceEdit(it, paths)
                .catch(reason => logger.error('could not force edit. Reason: ' + JSON.stringify(reason)))
        })
    }

    /**
     * Force file creation -> try to create and then update
     */
    private async forceEdit(project: ProjectSchema, paths: string[]) {
        const commitActions: any[] = this.createCommitActions(paths, CommitActionType.CREATE)

        // logger.info('send force edits for: ' + project.name + '(' + GitLabRepositoryManager.COMMIT_MSG + ')')
        for (const action of commitActions) {
            try {
                logger.debug('send create for ' + project.name + '/' + action.filePath)
                const promise = gitlab.Commits.create(
                    project.id,
                    'master',
                    GitLabRepositoryManager.COMMIT_MSG + ' [create]',
                    [action]
                )
                await promise.then(_ => logger.info('CREATED ' + project.name + '/' + action.filePath))
            } catch (e) {
                if (e.description !== GitLabRepositoryManager.FILE_EXISTS_ERROR) {
                    logger.error(project.name + '/' + action.filePath + ': ' + JSON.stringify(e))
                }

                action.action = CommitActionType.UPDATE.valueOf()
                await this.sendUpdateAction(project, action)
            }
        }
    }

    private async sendUpdateAction(project: ProjectSchema, commitAction: any) {
        logger.debug('send update: ' + project.name + '/' + commitAction.filePath)
        try {
            const promise = gitlab.Commits.create(
                project.id,
                'master',
                GitLabRepositoryManager.COMMIT_MSG + ' [update]',
                [commitAction]
            )

            await promise.then(_ => logger.info('UPDATED ' + project.name + '/' + commitAction.filePath))
        } catch (e) {
            logger.error('Error while updating: ' + project.name + '/' + commitAction.filePath + ' - ' + JSON.stringify(e))
        }
    }

    private createCommitActions(paths: string[], action: CommitActionType): any[] {
        const commitActions: any[] = []
        paths.forEach(path => {
            commitActions.push(GitLabRepositoryManager.createCommitAction(path, action))
        })
        return commitActions
    }
}
