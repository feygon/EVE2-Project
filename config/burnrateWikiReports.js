/**
 * @file config/burnrateWikiReports.js
 * @description Public BurnRate wiki report metadata.
 *   Isolated from the private Nickerson wiki config so the two-repo deploy
 *   overlay cannot replace the public BurnRate report inventory.
 */

const reports = [
    {
        slug: 'c1-app-quickstart',
        filename: 'c1-app-quickstart.md',
        title: 'Quick Start Guide',
        description: 'Short guide to navigating the BurnRate demo and reading the scenario outputs.',
        audience: 'c1',
        readingOrder: 1
    },
    {
        slug: 'c1-executive-summary',
        filename: 'c1-executive-summary.md',
        title: 'Executive Summary',
        description: 'High-level overview of the strategic plan and key decisions.',
        audience: 'c1',
        readingOrder: 2
    },
    {
        slug: 'c1-decision-timeline',
        filename: 'c1-decision-timeline.md',
        title: 'Decision Timeline',
        description: 'Chronological timeline of upcoming decisions and deadlines.',
        audience: 'c1',
        readingOrder: 3
    },
    {
        slug: 'decision-flowchart',
        filename: 'decision-flowchart.md',
        title: 'Decision Flowchart',
        description: 'Mermaid flowchart showing the major planning sequence and branch points.',
        audience: 'c1',
        readingOrder: 4
    },
    {
        slug: 'c1-trustee-cheatsheet',
        filename: 'c1-trustee-cheatsheet.md',
        title: 'Trustee Cheat Sheet',
        description: 'One-page reference card for day-to-day trustee responsibilities.',
        audience: 'c1',
        readingOrder: 5
    },
    {
        slug: 'questions-tracker',
        filename: 'c1-strategic-questions.md',
        title: 'Questions Tracker',
        description: 'Sanitized checklist of open advisor, facility, and execution questions.',
        audience: 'c1',
        readingOrder: 6
    },
    {
        slug: 'burnrate-demo-sequestration-report',
        filename: 'burnrate-demo/BURNRATE-DEMO-REPORT.md',
        title: 'Demo Sequestration Report',
        description: 'Summary of the BurnRate demo sequestration and VM validation regimen.',
        audience: 'demo',
        readingOrder: 7
    },
    {
        slug: 'strategic-plan-goals-and-maneuvers',
        filename: 'strategic-plan-goals-and-maneuvers.md',
        title: 'Strategic Plan: Goals and Maneuvers',
        description: 'Full strategic plan with goals, maneuvers, and contingencies.',
        audience: 'detailed',
        readingOrder: 8
    },
    {
        slug: 'inheritance-equity-analysis',
        filename: 'inheritance-equity-analysis.md',
        title: 'Inheritance Equity Analysis',
        description: 'Abbreviated equation-based summary of the estate equalization logic.',
        audience: 'detailed',
        readingOrder: 9
    },
    {
        slug: 'mapt-benefits-and-responsibilities',
        filename: 'mapt-benefits-and-responsibilities.md',
        title: 'MAPT Benefits and Responsibilities',
        description: 'Short explainer of the protection trust role, mechanics, and trustee duties.',
        audience: 'detailed',
        readingOrder: 10
    },
    {
        slug: 'snt-benefits-and-responsibilities',
        filename: 'snt-benefits-and-responsibilities.md',
        title: 'SNT Benefits and Responsibilities',
        description: 'Short explainer of the special-needs trust role, protections, and trustee duties.',
        audience: 'detailed',
        readingOrder: 11
    }
];

const validSlugs = new Set(reports.map((report) => report.slug));

function getReport(slug) {
    return reports.find((report) => report.slug === slug) || null;
}

function getNavigation(slug) {
    const index = reports.findIndex((report) => report.slug === slug);
    return {
        prev: index > 0 ? reports[index - 1] : null,
        next: index < reports.length - 1 ? reports[index + 1] : null
    };
}

module.exports = { reports, validSlugs, getReport, getNavigation };
