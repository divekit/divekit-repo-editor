import {RepoEditor} from './RepoEditor'
import {logger} from './util/Logger'


const repoEditor = new RepoEditor()
repoEditor.validateConfig().catch(_ => logger.error('Error while validating config'))
repoEditor.execute().catch(_ => logger.error('error while executing edits'))

// OpenTasks
// TODO update config to yml or ts format. To be able to use comments.
//  https://reflect.run/articles/typescript-the-perfect-file-format/
// - update commit based of student repo / identified via UUID
