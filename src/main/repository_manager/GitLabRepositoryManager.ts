import {Gitlab, ProjectSchema} from "gitlab"
import * as config from '../config/editorConfig.json'
import dotenv from "dotenv";
import {logger} from "../util/Logger";

dotenv.config();
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

    /**
     * iterate over the configured projects and update the repositories
     * according to the structure provided in **assets/**.
     * <br>
     * _Note: all changes of students are overwritten_
     */
    async processEdits(paths: string[]): Promise<void> {
        let projects: ProjectSchema[] = await GitLabRepositoryManager.getAllProjects()

        if (projects.length < 1) {
            logger.warn("can't find any projects")
            return
        }

        logger.debug(projects[0].name)
        // TODO for all projects: get repos -> push everything according to assets
    }

    /**
     * Get all projects inside multiple groups according to the config
     * <br>
     * _Used Config:
     * groupIds and onlyUpdateTestProjects+onlyUpdateCodeProjects flags._
     */
    private static async getAllProjects(): Promise<ProjectSchema[]> {
        let projects: ProjectSchema[] = []
        let groupNames = (await gitlab.Groups.all())
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

        let filterName = function (name: string) {
            if (config.onlyUpdateTestProjects) return name.includes(GitLabRepositoryManager.TEST_GROUP_FLAG)
            if (config.onlyUpdateCodeProjects) return !name.includes(GitLabRepositoryManager.TEST_GROUP_FLAG)
            return true
        }

        return projects.filter(it => filterName(it.name))
    }

}