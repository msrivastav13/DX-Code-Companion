'use strict';

export class OSUtil {

    public static toUnixStyle(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public static isWindowsOs(): boolean {
        if(process.platform.includes('win')) {
            return true;
        } else {
            return false;
        }
    }
}