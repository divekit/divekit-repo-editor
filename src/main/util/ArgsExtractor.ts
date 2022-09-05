import {logger} from './Logger'

export function getPathPrefix(): string {
    logger.debug('Argument input: ' + process.argv)
    const args: string[] = process.argv.slice(2) // remove node + script-path arguments
    logger.debug('Relevant args: ' + args)

    if (args.length === 0) return ''

    const useSetupInput = args.includes('useSetupInput')
    if (useSetupInput) return '../divekit-automated-repo-setup/resources/test/output'

    logger.warn('Argument inputs not valid. Ignoring arguments.')
    return ''
}
