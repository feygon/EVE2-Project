const { cleanupStaleSqliteSidecars, getSidecarPaths } = require('../../scripts/sqlite-sidecar-cleanup');

describe('SQLite Sidecar Cleanup', () => {
    function buildFs(state) {
        return {
            existsSync(filePath) {
                return Object.prototype.hasOwnProperty.call(state, filePath);
            },
            statSync(filePath) {
                if (!Object.prototype.hasOwnProperty.call(state, filePath)) {
                    throw new Error('missing file: ' + filePath);
                }
                return { mtimeMs: state[filePath].mtimeMs };
            },
            rmSync(filePath) {
                delete state[filePath];
            }
        };
    }

    it('derives wal and shm sidecar paths from a database path', () => {
        const paths = getSidecarPaths('/tmp/demo.db');
        expect(paths).to.deep.equal({
            wal: '/tmp/demo.db-wal',
            shm: '/tmp/demo.db-shm'
        });
    });

    it('does nothing when no sidecars exist', () => {
        const state = {
            '/tmp/demo.db': { mtimeMs: 200 }
        };

        const result = cleanupStaleSqliteSidecars('/tmp/demo.db', { fs: buildFs(state) });

        expect(result).to.deep.equal({ cleaned: false, deleted: [] });
        expect(state).to.have.property('/tmp/demo.db');
    });

    it('removes wal and shm when the main database file is newer than both sidecars', () => {
        const state = {
            '/tmp/demo.db': { mtimeMs: 300 },
            '/tmp/demo.db-wal': { mtimeMs: 200 },
            '/tmp/demo.db-shm': { mtimeMs: 100 }
        };

        const result = cleanupStaleSqliteSidecars('/tmp/demo.db', { fs: buildFs(state) });

        expect(result.cleaned).to.equal(true);
        expect(result.deleted).to.deep.equal(['/tmp/demo.db-wal', '/tmp/demo.db-shm']);
        expect(state).to.not.have.property('/tmp/demo.db-wal');
        expect(state).to.not.have.property('/tmp/demo.db-shm');
    });

    it('does not remove sidecars when either sidecar is newer than the main database file', () => {
        const state = {
            '/tmp/demo.db': { mtimeMs: 200 },
            '/tmp/demo.db-wal': { mtimeMs: 250 },
            '/tmp/demo.db-shm': { mtimeMs: 150 }
        };

        const result = cleanupStaleSqliteSidecars('/tmp/demo.db', { fs: buildFs(state) });

        expect(result).to.deep.equal({ cleaned: false, deleted: [] });
        expect(state).to.have.property('/tmp/demo.db-wal');
        expect(state).to.have.property('/tmp/demo.db-shm');
    });

    it('handles only one stale sidecar being present', () => {
        const state = {
            '/tmp/demo.db': { mtimeMs: 400 },
            '/tmp/demo.db-wal': { mtimeMs: 300 }
        };

        const result = cleanupStaleSqliteSidecars('/tmp/demo.db', { fs: buildFs(state) });

        expect(result).to.deep.equal({
            cleaned: true,
            deleted: ['/tmp/demo.db-wal']
        });
        expect(state).to.not.have.property('/tmp/demo.db-wal');
    });
});
