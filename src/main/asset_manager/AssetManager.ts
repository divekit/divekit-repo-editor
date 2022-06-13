import util from 'util'
import globModule from 'glob'
import {logger} from '../util/Logger'

const glob = util.promisify(globModule)

export class AssetManager {
    private assetPaths: string[] = []

    async updateAssets(src: string = 'assets'): Promise<void> {
        await glob(src + '/**/*.*').then((files: string[]) => {
            logger.info('found ' + files.length + ' assets')
            this.assetPaths = files
        })
    }

    getAssets(): string[] {
        if (this.assetPaths.length < 1) logger.warn('Assets are empty!')
        return this.assetPaths
    }
}
