const enum AssetType {
    CODE = 'code',
    TEST = 'test',
    ALL = 'all'
}

export class Asset {
    private static readonly UUID_REGEX = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')

    readonly localFilePath: string
    readonly gitFilePath: string
    readonly projectName: string | undefined
    readonly type: AssetType
    readonly isUserSpecific: boolean

    constructor(filePath: string) {
        this.localFilePath = filePath
        this.type = Asset.determineType(filePath)
        this.projectName = Asset.determineProjectName(filePath)
        this.isUserSpecific = this.projectName !== undefined
        this.gitFilePath = this.extractGitPath(filePath)
    }

    private static determineProjectName(path: string): string | undefined {
        const breadcrumbs = path.split('/')
        return breadcrumbs.find(it => this.UUID_REGEX.test(it))
    }

    private static determineType(path: string): AssetType {
        const breadcrumbs = path.split('/')

        for (const it of breadcrumbs) {
            switch (it) {
                case AssetType.ALL.valueOf():
                    return AssetType.ALL
                case AssetType.TEST.valueOf():
                    return AssetType.TEST
                case AssetType.CODE.valueOf():
                    return AssetType.CODE
            }
        }

        throw new Error('files may only be placed in the subdirectories: all, code and test: ' + path)
    }

    /**
     * extracts the git path from the current file path in the local file system <br>
     * _note also ignores the current owner, if set_
     */
    private extractGitPath(path: string): string {
        let gitPath = path.substr(path.indexOf(this.type.valueOf()))
        gitPath = gitPath.replace(this.type.valueOf() + '/', '')

        if (this.projectName) {
            gitPath = gitPath.replace(this.projectName + '/', '')
        }

        return gitPath
    }
}
