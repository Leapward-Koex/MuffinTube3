import fs from 'fs'

export const ensureEmptyFileExists = (filePath: string) => {
    return new Promise<void>((resolve) => {
        fs.unlink(filePath, (removeError) => {
            if (removeError && removeError.code !== 'ENOENT') throw removeError;
            fs.open(filePath, "wx",  (openError, fd) => {
                if (openError) throw openError;
                fs.close(fd, (closeError) => {
                    if (closeError) throw closeError;
                    resolve();
                });
            });
        });
    })
}