'use strict';

export class OSUtil {

    public static toUnixStyle(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public static isWindowsOs(): boolean {
        const operatingsystem : string = process.platform;
        if(operatingsystem.includes('win')) {
            return true;
        } else {
            return false;
        }
    }
}