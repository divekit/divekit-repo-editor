import {RepoEditor} from './RepoEditor'
import {logger} from './util/Logger'


const repoEditor = new RepoEditor()
repoEditor.validateConfig().catch(_ => logger.error('Error while validating config'))
repoEditor.execute().catch(_ => logger.error('error while executing edits'))
