import {Gitlab, ProjectSchema} from "gitlab"
import * as config from '../config/editorConfig.json'
import dotenv from "dotenv";

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
    async processEdits(): Promise<void> {
        let projects: ProjectSchema[] = await GitLabRepositoryManager.getAllProjects()

        if (projects.length < 1) {
            console.warn("can't find any projects")
            return
        }

        console.log(projects[0])
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

        for (const groupId of config.groupIds) {
            const projectsOfGroup = await gitlab.GroupProjects.all(groupId)
            projects = projects.concat(projectsOfGroup)
        }

        let filter = function (name: string) {
            if (config.onlyUpdateTestProjects) return name.includes(GitLabRepositoryManager.TEST_GROUP_FLAG)
            if (config.onlyUpdateCodeProjects) return !name.includes(GitLabRepositoryManager.TEST_GROUP_FLAG)
            return true
        }

        return projects.filter(it => {
            filter(it.name)
        })
    }

}