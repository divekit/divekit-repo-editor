import {RepoEditor} from './RepoEditor'
import {logger} from './util/Logger'
import {AssetManager} from './asset_manager/AssetManager'
import {getPathPrefix} from './util/ArgsExtractor'


const pathPrefix = getPathPrefix()
const assetManager = new AssetManager(pathPrefix)
const repoEditor = new RepoEditor(assetManager)
repoEditor.validateConfig().catch(it => logger.error('Error while validating config: ' + it))
repoEditor.execute().catch(it => logger.error('error while executing edits: ' + it))
