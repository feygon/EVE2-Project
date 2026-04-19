/**
 * BurnRate sequestration checks.
 * These guard the additive demo route from regressing into Nickerson route
 * links or outside-path references in BurnRate-specific files.
 */

const fs = require('fs');
const path = require('path');

describe('BurnRate Sequestration Checks', () => {
    const projectRoot = path.join(__dirname, '../..');
    const burnRateFiles = [
        'BurnRate.js',
        'dbcon_burnrate.js',
        'scripts/BurnRateCallbacks.js',
        'views/layouts/burnrate.handlebars',
        'views/burnrate/scenarios.handlebars',
        'views/burnrate/scenario-detail.handlebars',
        'views/partials/burnrate-param-sidebar.handlebars',
        'public/js/burnrate-scenarios.js',
        'public/js/burnrate-param-sidebar.js'
    ];

    burnRateFiles.forEach((relativePath) => {
        it(`keeps ${relativePath} free of Nickerson route links`, () => {
            const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
            expect(content).to.not.include('/Nickerson/');
        });
    });

    burnRateFiles.forEach((relativePath) => {
        it(`keeps ${relativePath} free of absolute local path references`, () => {
            const content = fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
            expect(content).to.not.match(/[A-Z]:\\\\/);
            expect(content).to.not.match(/[A-Z]:\//);
            expect(content).to.not.include('BurnRate-Private');
            expect(content).to.not.include('file://');
            expect(content).to.not.include('vscode://');
        });
    });

    it('keeps BurnRateCallbacks self-contained by filename', () => {
        const content = fs.readFileSync(
            path.join(projectRoot, 'scripts/BurnRateCallbacks.js'),
            'utf8'
        );
        expect(content).to.not.include('NickersonCallbacks');
    });

    it('keeps overview slider wiring for the expanded BurnRate parameter set', () => {
        const content = fs.readFileSync(
            path.join(projectRoot, 'public/js/burnrate-scenarios.js'),
            'utf8'
        );
        [
            'sdira_start',
            'ssdi_monthly',
            'lifestyle_floor_monthly',
            'charitable_monthly',
            'mc_maintenance_monthly',
            'mc_residual_monthly',
            'snt_seed'
        ].forEach((key) => {
            expect(content).to.include(`'${key}'`);
        });
    });

    it('keeps detail sidebar wiring for the expanded BurnRate parameter set', () => {
        const content = fs.readFileSync(
            path.join(projectRoot, 'public/js/burnrate-param-sidebar.js'),
            'utf8'
        );
        [
            'ssdi_monthly',
            'lifestyle_floor_monthly',
            'charitable_monthly',
            'mc_maintenance_monthly',
            'mc_residual_monthly',
            'snt_seed'
        ].forEach((key) => {
            expect(content).to.include(`'${key}'`);
        });
    });
});
