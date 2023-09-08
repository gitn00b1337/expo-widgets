
// very simple logger to avoid poluting end users with debug messages
class Logger {
    readonly showDebug: boolean = false
    readonly consoleAvailable: boolean = false

    constructor() {
        if (typeof process?.env !== 'undefined') {
            this.showDebug = process.env.NODE_ENV?.toLowerCase() === 'development' || false
        }
        this.consoleAvailable = typeof console !== 'undefined'
    }

    debug(message?: any, ...optionalParams: any[]) {
        if (!this.showDebug || !this.consoleAvailable) {
            return
        }

        console.debug(message, ...optionalParams)
    }

    warn(message?: any, ...optionalParams: any[]) {
        if (!this.consoleAvailable) {
            return;
        }

        console.warn(message, optionalParams);
    }
}

export class Logging {
    private static instance?: Logger

    static get logger() {
        if (!this.instance) {
            this.instance = new Logger()
        }

        return this.instance
    }
}
