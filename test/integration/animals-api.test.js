/**
 * Integration Tests for Animals API Endpoints
 * Tests the full request/response cycle for the Animals SPA
 */

const request = require('supertest');
const express = require('express');
const path = require('path');

describe('Animals API Integration Tests', () => {
    let app;

    before(() => {
        // Set up a minimal Express app for testing
        app = express();
        
        // Set up Handlebars
        const handlebars = require('express-handlebars').create({
            defaultLayout: null,
            helpers: require('../../views/helpers/helpers')
        });
        app.engine('handlebars', handlebars.engine);
        app.set('view engine', 'handlebars');
        app.set('views', path.join(__dirname, '../../views'));
        
        // Set up callbacks
        app.set('animalsCallbacks', require('../../scripts/animalsCallbacks'));
        
        // Mount animals router
        app.use('/animals', require('../../animals'));
    });

    describe('GET /animals', () => {
        // Test HTTP response: main page should return 200 OK status
        it('should return 200 status', (done) => {
            request(app)
                .get('/animals')
                .expect(200, done);
        });

        // Test content type: should render HTML page (not JSON)
        it('should render animals.handlebars template', (done) => {
            request(app)
                .get('/animals')
                .expect('Content-Type', /html/)
                .expect((res) => {
                    expect(res.text).to.include('Summon Animal');
                    expect(res.text).to.include('animals');
                })
                .end(done);
        });

        // Test metadata rendering: page should include animal count and level range
        it('should include metadata in rendered page', (done) => {
            request(app)
                .get('/animals')
                .expect((res) => {
                    expect(res.text).to.include('animals');
                    expect(res.text).to.include('Level');
                })
                .end(done);
        });
    });

    describe('GET /animals/api/list', () => {
        // Test API response: should return JSON with animals data
        it('should return JSON with all animals', (done) => {
            request(app)
                .get('/animals/api/list')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.property('count');
                    expect(res.body).to.have.property('animals');
                    expect(res.body.animals).to.be.an('array');
                })
                .end(done);
        });

        // Test level filtering: should only return animals with matching level (any version)
        it('should filter by level parameter', (done) => {
            request(app)
                .get('/animals/api/list?level=1')
                .expect(200)
                .expect((res) => {
                    expect(res.body.animals).to.be.an('array');
                    // All returned animals should have level 1 in some version
                    res.body.animals.forEach(animal => {
                        const hasLevel1 = 
                            animal.versions.normal.level === 1 ||
                            (animal.versions.weak && animal.versions.weak.level === 1) ||
                            animal.versions.elite.level === 1;
                        expect(hasLevel1).to.be.true;
                    });
                })
                .end(done);
        });

        // Test trait filtering: should only return animals with specified trait
        it('should filter by trait parameter', (done) => {
            request(app)
                .get('/animals/api/list?trait=Animal')
                .expect(200)
                .expect((res) => {
                    expect(res.body.animals).to.be.an('array');
                    // All returned animals should have Animal trait
                    res.body.animals.forEach(animal => {
                        expect(animal.versions.normal.traits).to.include('Animal');
                    });
                })
                .end(done);
        });

        // Test size filtering: should only return animals of specified size
        it('should filter by size parameter', (done) => {
            request(app)
                .get('/animals/api/list?size=Large')
                .expect(200)
                .expect((res) => {
                    res.body.animals.forEach(animal => {
                        expect(animal.versions.normal.size).to.equal('Large');
                    });
                })
                .end(done);
        });

        // Test HP range filtering: should only return animals within HP range
        it('should filter by HP range', (done) => {
            request(app)
                .get('/animals/api/list?minHp=50&maxHp=100')
                .expect(200)
                .expect((res) => {
                    res.body.animals.forEach(animal => {
                        const hp = animal.versions.normal.hp;
                        expect(hp).to.be.at.least(50);
                        expect(hp).to.be.at.most(100);
                    });
                })
                .end(done);
        });

        // Test flying filter: should only return animals with fly speed > 0
        it('should filter by flying capability', (done) => {
            request(app)
                .get('/animals/api/list?hasFlying=true')
                .expect(200)
                .expect((res) => {
                    res.body.animals.forEach(animal => {
                        expect(animal.versions.normal.speed.fly).to.be.greaterThan(0);
                    });
                })
                .end(done);
        });

        // Test swimming filter: should only return animals with swim speed > 0
        it('should filter by swimming capability', (done) => {
            request(app)
                .get('/animals/api/list?hasSwimming=true')
                .expect(200)
                .expect((res) => {
                    res.body.animals.forEach(animal => {
                        expect(animal.versions.normal.speed.swim).to.be.greaterThan(0);
                    });
                })
                .end(done);
        });

        // Test multiple filters: should apply all filters with AND logic
        it('should handle multiple filters simultaneously', (done) => {
            request(app)
                .get('/animals/api/list?size=Large&hasFlying=true')
                .expect(200)
                .expect((res) => {
                    res.body.animals.forEach(animal => {
                        expect(animal.versions.normal.size).to.equal('Large');
                        expect(animal.versions.normal.speed.fly).to.be.greaterThan(0);
                    });
                })
                .end(done);
        });

        // Test response accuracy: count should match actual array length
        it('should return correct count in response', (done) => {
            request(app)
                .get('/animals/api/list')
                .expect(200)
                .expect((res) => {
                    expect(res.body.count).to.equal(res.body.animals.length);
                })
                .end(done);
        });
    });

    describe('GET /animals/api/detail/:id', () => {
        let validAnimalId;

        before((done) => {
            // Get a valid animal ID for testing
            request(app)
                .get('/animals/api/list')
                .expect(200)
                .end((err, res) => {
                    if (!err && res.body.animals.length > 0) {
                        validAnimalId = res.body.animals[0].id;
                    }
                    done(err);
                });
        });

        // Test successful detail retrieval: should return full animal object for valid ID
        it('should return animal details for valid ID', (done) => {
            request(app)
                .get(`/animals/api/detail/${validAnimalId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.have.property('id', validAnimalId);
                    expect(res.body).to.have.property('name');
                    expect(res.body).to.have.property('versions');
                })
                .end(done);
        });

        // Test 404 error: non-existent ID should return 404 status with error message
        it('should return 404 for invalid ID', (done) => {
            request(app)
                .get('/animals/api/detail/nonexistent-id-12345')
                .expect(404)
                .expect((res) => {
                    expect(res.body).to.have.property('error');
                    expect(res.body.error).to.include('not found');
                })
                .end(done);
        });

        // Test complete object: response should include all versions and stats
        it('should return complete animal object', (done) => {
            request(app)
                .get(`/animals/api/detail/${validAnimalId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.versions).to.have.property('normal');
                    expect(res.body.versions).to.have.property('elite');
                    expect(res.body.versions.normal).to.have.property('hp');
                    expect(res.body.versions.normal).to.have.property('ac');
                })
                .end(done);
        });
    });
});
