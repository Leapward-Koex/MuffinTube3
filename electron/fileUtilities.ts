import fs from 'fs'

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
        await deleteFile(filePath)
        fs.open(filePath, "wx",  (openError, fd) => {
            if (openError) throw openError;
            fs.close(fd, (closeError) => {
                if (closeError) throw closeError;
                resolve();
            });
        });
    })
}