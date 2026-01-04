/**
 * Unit Tests for Animals Callbacks
 * Tests the business logic for the Animals SPA
 */

const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fs = require('fs').promises;

describe('Animals Callbacks', () => {
    let animalsCallbacks;
    let fsStub;
    let configStub;
    
    beforeEach(() => {
        // Reset module cache
        delete require.cache[require.resolve('../../scripts/animalsCallbacks')];
        
        // Create stubs
        fsStub = {
            readFile: sinon.stub()
        };
        
        configStub = {
            DATA_PATH: 'test/fixtures/animals-data.json',
            CACHE_DURATION_MS: 300000,
            MAX_RETRY_ATTEMPTS: 3,
            RETRY_DELAY_MS: 100,
            AONPRD_BASE_URL: 'https://2e.aonprd.com'
        };
        
        // Load module with stubs
        animalsCallbacks = proxyquire('../../scripts/animalsCallbacks', {
            'fs': { promises: fsStub },
            './animals-config': configStub
        });
    });
    
    afterEach(() => {
        sinon.restore();
        animalsCallbacks.clearCache();
    });

    describe('loadAnimalsData()', () => {
        const mockData = {
            metadata: { animal_count: 2 },
            animals: [
                { id: 'test1', name: 'Test Animal 1' },
                { id: 'test2', name: 'Test Animal 2' }
            ]
        };

        // Test basic file loading: verify JSON file is read and parsed correctly
        it('should load and parse JSON data correctly', async () => {
            fsStub.readFile.resolves(JSON.stringify(mockData));
            
            const result = await animalsCallbacks.loadAnimalsData();
            
            expect(result).to.deep.equal(mockData);
            expect(fsStub.readFile).to.have.been.calledOnce;
        });

        // Test caching mechanism: second call should use cached data, not reload file
        it('should return cached data when cache is valid', async () => {
            fsStub.readFile.resolves(JSON.stringify(mockData));
            
            // First call - loads from file
            await animalsCallbacks.loadAnimalsData();
            
            // Second call - should use cache
            const result = await animalsCallbacks.loadAnimalsData();
            
            expect(result).to.deep.equal(mockData);
            expect(fsStub.readFile).to.have.been.calledOnce; // Still only called once
        });

        // Test cache bypass: forceReload=true should ignore cache and reload from file
        it('should force reload when forceReload=true', async () => {
            fsStub.readFile.resolves(JSON.stringify(mockData));
            
            await animalsCallbacks.loadAnimalsData();
            await animalsCallbacks.loadAnimalsData(true); // Force reload
            
            expect(fsStub.readFile).to.have.been.calledTwice;
        });

        // Test concurrent requests: multiple simultaneous calls should only trigger one file read
        it('should handle concurrent load requests (isLoading flag)', async () => {
            fsStub.readFile.resolves(JSON.stringify(mockData));
            
            // Fire off two requests simultaneously WITHOUT awaiting
            const promise1 = animalsCallbacks.loadAnimalsData();
            const promise2 = animalsCallbacks.loadAnimalsData();
            
            // Both should succeed and return same data
            const [result1, result2] = await Promise.all([promise1, promise2]);
            
            // But file should only be read ONCE (not twice)
            expect(fsStub.readFile).to.have.been.calledOnce;
            expect(result1).to.deep.equal(mockData);
            expect(result2).to.deep.equal(mockData);
        });

        // Test data validation: missing 'animals' array should throw error (defensive programming)
        it('should validate data structure (animals array exists)', async () => {
            fsStub.readFile.resolves(JSON.stringify({ metadata: {} }));
            
            try {
                await animalsCallbacks.loadAnimalsData();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Invalid data structure');
            }
        });

        // Test retry logic: should retry failed reads up to MAX_RETRY_ATTEMPTS (resilience)
        it('should retry up to MAX_RETRY_ATTEMPTS times', async () => {
            fsStub.readFile
                .onFirstCall().rejects(new Error('Read error'))
                .onSecondCall().rejects(new Error('Read error'))
                .onThirdCall().resolves(JSON.stringify(mockData));
            
            const result = await animalsCallbacks.loadAnimalsData();
            
            expect(result).to.deep.equal(mockData);
            expect(fsStub.readFile).to.have.been.calledThrice;
        });

        // Test max retry failure: after all retries exhausted, should throw final error
        it('should throw error after max retry attempts', async () => {
            fsStub.readFile.rejects(new Error('Persistent error'));
            
            try {
                await animalsCallbacks.loadAnimalsData();
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.include('Failed to load animals data after');
            }
        });

        // Test stale cache fallback: if reload fails but stale cache exists, return stale data
        it('should return stale cache as fallback on error', async () => {
            fsStub.readFile.resolves(JSON.stringify(mockData));
            
            // Load data initially
            await animalsCallbacks.loadAnimalsData();
            
            // Now make it fail
            fsStub.readFile.rejects(new Error('Network error'));
            
            // Should return stale cache
            const result = await animalsCallbacks.loadAnimalsData(true);
            expect(result).to.deep.equal(mockData);
        });
    });

    describe('clearCache()', () => {
        // Test cache clearing: verify cache is cleared and next call reloads from file
        it('should clear animalsCache and lastLoadTime', async () => {
            const mockData = {
                metadata: { animal_count: 1 },
                animals: [{ id: 'test', name: 'Test' }]
            };
            
            fsStub.readFile.resolves(JSON.stringify(mockData));
            
            await animalsCallbacks.loadAnimalsData();
            animalsCallbacks.clearCache();
            
            // Should reload from file after cache clear
            await animalsCallbacks.loadAnimalsData();
            expect(fsStub.readFile).to.have.been.calledTwice;
        });
    });

    describe('filterAnimals(req, res)', () => {
        let req, res;
        const mockData = {
            animals: [
                {
                    id: 'dog',
                    name: 'Dog',
                    versions: {
                        normal: { 
                            level: 1, 
                            traits: ['Animal'], 
                            size: 'Small',
                            hp: 8,
                            speed: { land: 40, fly: 0, swim: 0 }
                        },
                        elite: { level: 3 }
                    }
                },
                {
                    id: 'eagle',
                    name: 'Eagle',
                    versions: {
                        normal: { 
                            level: 2, 
                            traits: ['Animal'], 
                            size: 'Small',
                            hp: 15,
                            speed: { land: 10, fly: 60, swim: 0 }
                        },
                        elite: { level: 4 }
                    }
                },
                {
                    id: 'bear',
                    name: 'Bear',
                    versions: {
                        normal: { 
                            level: 4, 
                            traits: ['Animal'], 
                            size: 'Large',
                            hp: 60,
                            speed: { land: 35, fly: 0, swim: 0 }
                        },
                        elite: { level: 6 }
                    }
                }
            ]
        };

        beforeEach(() => {
            req = { query: {} };
            res = {
                json: sinon.stub(),
                status: sinon.stub().returnsThis()
            };
            
            fsStub.readFile.resolves(JSON.stringify(mockData));
        });

        // Test level filter: should return animals with level 3 in any version (normal/weak/elite)
        it('should filter by level (checks all versions)', async () => {
            req.query.level = '3';
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.json).to.have.been.calledWith({
                count: 1,
                animals: sinon.match(arr => arr[0].id === 'dog')
            });
        });

        // Test trait filter: should return only animals with specified trait
        it('should filter by trait', async () => {
            req.query.trait = 'Animal';
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.json).to.have.been.calledWith({
                count: 3,
                animals: mockData.animals
            });
        });

        // Test size filter: should return only animals of specified size (Large, Small, etc.)
        it('should filter by size', async () => {
            req.query.size = 'Large';
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.json).to.have.been.calledWith({
                count: 1,
                animals: sinon.match(arr => arr[0].id === 'bear')
            });
        });

        // Test HP range filter: should return animals with HP between minHp and maxHp
        it('should filter by HP range', async () => {
            req.query.minHp = '10';
            req.query.maxHp = '50';
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.json).to.have.been.calledWith({
                count: 1,
                animals: sinon.match(arr => arr[0].id === 'eagle')
            });
        });

        // Test flying filter: should return only animals with fly speed > 0
        it('should filter by flying capability', async () => {
            req.query.hasFlying = 'true';
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.json).to.have.been.calledWith({
                count: 1,
                animals: sinon.match(arr => arr[0].id === 'eagle')
            });
        });

        // Test multiple filters: should combine all filters with AND logic
        it('should handle multiple filters simultaneously', async () => {
            req.query.size = 'Small';
            req.query.hasFlying = 'true';
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.json).to.have.been.calledWith({
                count: 1,
                animals: sinon.match(arr => arr[0].id === 'eagle')
            });
        });

        // Test error handling: should return 500 status with error message on failure
        it('should return 500 status on error', async () => {
            fsStub.readFile.rejects(new Error('File error'));
            animalsCallbacks.clearCache();
            
            await animalsCallbacks.filterAnimals(req, res);
            
            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith(sinon.match({
                error: 'Failed to fetch animals'
            }));
        });
    });

    describe('getAnimalDetail(req, res)', () => {
        let req, res;
        const mockData = {
            animals: [
                { id: 'dog', name: 'Dog', versions: { normal: { level: 1 } } },
                { id: 'cat', name: 'Cat', versions: { normal: { level: 1 } } }
            ]
        };

        beforeEach(() => {
            req = { params: {} };
            res = {
                json: sinon.stub(),
                status: sinon.stub().returnsThis()
            };
            
            fsStub.readFile.resolves(JSON.stringify(mockData));
        });

        // Test successful lookup: should return complete animal object for valid ID
        it('should find animal by ID', async () => {
            req.params.id = 'dog';
            
            await animalsCallbacks.getAnimalDetail(req, res);
            
            expect(res.json).to.have.been.calledWith(
                sinon.match({ id: 'dog', name: 'Dog' })
            );
        });

        // Test not found: should return 404 status for non-existent animal ID
        it('should return 404 when animal not found', async () => {
            req.params.id = 'nonexistent';
            
            await animalsCallbacks.getAnimalDetail(req, res);
            
            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith(sinon.match({
                error: 'Animal not found'
            }));
        });

        // Test error handling: should return 500 status if data loading fails
        it('should return 500 status on error', async () => {
            fsStub.readFile.rejects(new Error('File error'));
            animalsCallbacks.clearCache();
            req.params.id = 'dog';
            
            await animalsCallbacks.getAnimalDetail(req, res);
            
            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith(sinon.match({
                error: 'Failed to fetch animal details'
            }));
        });
    });

    describe('getAnimalsPage(res, context, complete)', () => {
        let res, context, complete;
        const mockData = {
            metadata: { animal_count: 2 },
            trait_index: {
                'Animal': ['dog', 'cat'],
                'Minion': ['dog']
            },
            animals: [
                {
                    id: 'dog',
                    name: 'Dog',
                    baseLevel: 1,
                    versions: {
                        normal: { level: 1, traits: ['Animal'] },
                        weak: { level: 0 },
                        elite: { level: 3 }
                    }
                },
                {
                    id: 'cat',
                    name: 'Cat',
                    baseLevel: 2,
                    versions: {
                        normal: { level: 2, traits: ['Animal'] },
                        elite: { level: 4 }
                    }
                }
            ]
        };

        beforeEach(() => {
            res = {
                status: sinon.stub().returnsThis(),
                send: sinon.stub()
            };
            context = {};
            complete = sinon.stub();
            
            fsStub.readFile.resolves(JSON.stringify(mockData));
        });

        // Test successful page load: should call complete callback after data loads
        it('should load data successfully', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(complete).to.have.been.calledOnce;
        });

        // Test context population: should add metadata to context object
        it('should populate context with metadata', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(context.metadata).to.deep.equal(mockData.metadata);
        });

        // Test context population: should add animals array to context
        it('should populate context with animals array', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(context.animals).to.deep.equal(mockData.animals);
        });

        // Test trait extraction: should extract unique traits from trait_index for filtering
        it('should extract unique traits for filtering', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(context.traits).to.have.members(['Animal', 'Minion']);
        });

        // Test level range calculation: should find min/max levels across all versions
        it('should calculate correct min/max level range', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(context.minLevel).to.equal(0); // From weak version
            expect(context.maxLevel).to.equal(4); // From elite version
        });

        // Test AONPRD URL: should add Archives of Nethys base URL to context
        it('should add aonprdBaseUrl to context', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(context.aonprdBaseUrl).to.equal('https://2e.aonprd.com');
        });

        // Test callback invocation: should call complete callback after success
        it('should call complete() callback', async () => {
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(complete).to.have.been.calledOnce;
        });

        // Test error handling: should send 500 error and NOT call complete on failure
        it('should return 500 error on failure', async () => {
            fsStub.readFile.rejects(new Error('Load error'));
            animalsCallbacks.clearCache();
            
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(res.status).to.have.been.calledWith(500);
            expect(res.send).to.have.been.called;
            expect(complete).to.not.have.been.called;
        });

        // Test trait_index fallback: should handle missing trait_index gracefully
        it('should handle missing trait_index', async () => {
            const dataWithoutTraitIndex = {
                metadata: { animal_count: 1 },
                animals: [
                    {
                        id: 'dog',
                        name: 'Dog',
                        versions: {
                            normal: { level: 1 },
                            elite: { level: 3 }
                        }
                    }
                ]
            };
            
            fsStub.readFile.resolves(JSON.stringify(dataWithoutTraitIndex));
            animalsCallbacks.clearCache();
            
            await animalsCallbacks.getAnimalsPage(res, context, complete);
            
            expect(context.traits).to.deep.equal([]);
            expect(complete).to.have.been.calledOnce;
        });
    });
});

