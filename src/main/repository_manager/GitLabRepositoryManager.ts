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
    private static readonly TEST_GROUP_FLAG: string = 'tests_group'
    private static readonly COMMIT_MSG: string = config.commitMsg

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
     * extracts the action from path
     * @param path in the following pattern: "assets/<ACTION>/*". Action can be one of: create, update, move, delete
     */
    private static getActionFromPath(path: string): string {
        const splitPath = path.split('/')
        return splitPath[1]
    }

    /**
     * Extract the path without the prefix from the directory structure
     * e.g. remove `assets/update/` from `assets/update/README.md`
     */
    private static getGitFilePath(path: string): string {
        const re = /assets\/[a-z]*\/*/
        return path.replace(re, '')
    }

    private static readFileContent(path: string) {
        return fs.readFileSync(path).toString()
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

        this.updateAllProjects(projects, paths)
    }

    private updateAllProjects(projects: ProjectSchema[], paths: string[]) {
        projects.forEach(it => this.updateFiles(it, paths))
    }

    /**
     * Update all given files in a project
     * @param project to be updated
     * @param paths list of paths to all files that will be updated
     */
    private updateFiles(project: ProjectSchema, paths: string[]) {
        const commitActions: any[] = []
        paths.forEach(path => {
            const fileContent = GitLabRepositoryManager.readFileContent(path)
            const commitAction: any = {
                action: GitLabRepositoryManager.getActionFromPath(path),
                filePath: GitLabRepositoryManager.getGitFilePath(path),
                content: fileContent
            }
            commitActions.push(commitAction)
        })

        logger.debug('send commit (' + GitLabRepositoryManager.COMMIT_MSG + ') for ' + project.name + '')
        const promise = gitlab.Commits.create(
            project.id,
            'master',
            GitLabRepositoryManager.COMMIT_MSG,
            commitActions
        )
        promise.catch(it => logger.error('Error while updating: ' + JSON.stringify(it)))
        promise.then(_ => logger.info('edited ' + project.name))
    }
}
