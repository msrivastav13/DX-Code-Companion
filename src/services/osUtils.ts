'use strict';

export class OSUtil {

    public static toUnixStyle(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public static isWindowsOs(): boolean {
        // process.platform is 'win32' on all Windows versions ('darwin' also contains 'win')
        return process.platform === 'win32';
    }
}