import fs, { constants as FsConstants } from 'fs'

export const doesFileExist = (filePath: string) => {
    return new Promise<boolean>((resolve) => {
        fs.access(filePath, FsConstants.F_OK, (err) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

export const deleteFile = (filePath: string) => {
    return new Promise<void>((resolve) => {
        fs.unlink(filePath, (removeError) => {
            if (removeError && removeError.code !== 'ENOENT') throw removeError;
            resolve();
        });
    });
}

export const ensureEmptyFileExists = (filePath: string) => {
    return new Promise<void>(async (resolve) => {
        const fileExists = await doesFileExist(filePath);
        if (fileExists) {
            await deleteFile(filePath)
        }
        fs.open(filePath, "wx",  (openError, fd) => {
            if (openError) throw openError;
            fs.close(fd, (closeError) => {
                if (closeError) throw closeError;
                resolve();
            });
        });
    })
}