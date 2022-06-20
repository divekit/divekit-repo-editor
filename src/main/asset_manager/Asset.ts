export class Asset {
    private static readonly UUID_REGEX = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')

    readonly localFilePath: string
    readonly gitFilePath: string
    readonly projectName: string | undefined

    constructor(filePath: string) {
        this.localFilePath = filePath
        this.projectName = Asset.determineProjectName(filePath)
        this.gitFilePath = Asset.extractGitPath(filePath, this.projectName !== undefined)
    }

    private static determineProjectName(path: string): string | undefined {
        const splitPath = path.split('/')
        if (splitPath.length < 3) return undefined
        const projectName = splitPath[2]
        if (this.UUID_REGEX.test(projectName)) return projectName
        return undefined
    }

    /**
     * extracts the git path from the current file path in the local file system <br>
     * _note also ignores the current owner, if set_
     */
    private static extractGitPath(path: string, includesName: boolean): string {
        let depthCount = 1 // e.g. assets/README.md
        if (includesName) depthCount = 3 // e.g. assets/students/ST2M2_tests_group_824e7ace-30a3-4670-ab6c-e56a9a42f2d7/README.md

        const splitPath = path.split('/', depthCount)
        const prefix = splitPath.join('/') + '/'

        return path.replace(prefix, '')
    }
}
