import util from 'util'
import globModule from 'glob'
import {logger} from '../util/Logger'
import {Asset} from './Asset'

const glob = util.promisify(globModule)

export class AssetManager {
    private assets: Asset[] = []

    async updateAssets(src: string = 'assets'): Promise<void> {
        await glob(src + '/**/*.*').then((files: string[]) => {
            logger.info('found ' + files.length + ' assets')
            this.assets = files.map(it => new Asset(it))
        })
    }

    getAssets(): Asset[] {
        if (this.assets.length < 1) logger.warn('Assets are empty!')
        return this.assets
    }
}
