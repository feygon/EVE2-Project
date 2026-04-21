'use strict';

const fs = require('fs');

function getSidecarPaths(dbPath) {
    return {
        wal: dbPath + '-wal',
        shm: dbPath + '-shm'
    };
}

function sidecarExists(fsImpl, filePath) {
    try {
        return fsImpl.existsSync(filePath);
    } catch (err) {
        return false;
    }
}

function cleanupStaleSqliteSidecars(dbPath, options) {
    const fsImpl = (options && options.fs) || fs;
    const logger = (options && options.logger) || null;
    const paths = getSidecarPaths(dbPath);

    if (!sidecarExists(fsImpl, dbPath)) {
        return { cleaned: false, deleted: [] };
    }

    const existingSidecars = [paths.wal, paths.shm].filter((filePath) => sidecarExists(fsImpl, filePath));
    if (existingSidecars.length === 0) {
        return { cleaned: false, deleted: [] };
    }

    const dbStat = fsImpl.statSync(dbPath);
    const sidecarStats = existingSidecars.map((filePath) => ({
        filePath: filePath,
        stat: fsImpl.statSync(filePath)
    }));

    const shouldReset = sidecarStats.every((entry) => dbStat.mtimeMs > entry.stat.mtimeMs);
    if (!shouldReset) {
        return { cleaned: false, deleted: [] };
    }

    const deleted = [];
    existingSidecars.forEach((filePath) => {
        fsImpl.rmSync(filePath, { force: true });
        deleted.push(filePath);
    });

    if (logger && typeof logger.log === 'function') {
        logger.log('[sqlite] removed stale sidecars for ' + dbPath + ': ' + deleted.join(', '));
    }

    return { cleaned: deleted.length > 0, deleted: deleted };
}

module.exports = {
    cleanupStaleSqliteSidecars,
    getSidecarPaths
};
