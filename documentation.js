/**
 * @file Documentation routes module
 * @summary Handles all documentation-related routes including portal, markdown files, and README
 * @description Serves the documentation portal with dynamic file discovery, static markdown files, and project README
 * @date 2025-12-24
 * @author Feygon Nickerson
 */

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
/**
 * Documentation Portal Route - Dynamic Discovery with Handlebars
 * Scans docs folder and generates portal dynamically
 */
router.get('/documentation', (req, res) => {
    const docsDir = path.join(__dirname, 'docs');
    
    // Whitelist of allowed categories (security measure)
    const allowedCategories = [
        'setup',
        'deployment',
        'git',
        'development',
        'archive',
        'summaries'
    ];
    
    const badgeColors = {
        setup: 'setup',
        deployment: 'deployment',
        git: 'git',
        development: 'dev',
        archive: 'archive',
        summaries: 'process'
    };
    
    const categoryEmojis = {
        setup: '??',
        deployment: '??',
        git: '??',
        development: '??',
        archive: '??',
        summaries: '??'
    };
    
    const categoryTitles = {
        setup: 'Setup & Installation',
        deployment: 'Deployment',
        git: 'Git Workflow',
        development: 'Development',
        archive: 'Archive (Historical)',
        summaries: 'Session Summaries'
    };
    
    // Discover documentation files
    let docStructure = {};
    let totalDocs = 0;
    
    allowedCategories.forEach(category => {
        const categoryPath = path.join(docsDir, category);
        
        // Security: Verify path is within docs folder
        if (!categoryPath.startsWith(docsDir)) {
            return; // Path traversal attempt, skip
        }
        
        // Check if directory exists
        if (!fs.existsSync(categoryPath)) {
            return; // Directory doesn't exist, skip
        }
        
        try {
            const files = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.md')) // Only .md files
                .map(file => {
                    const filePath = path.join(categoryPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Extract title from first # heading or use filename
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1].replace(/[#??????????????????]/g, '').trim() : file.replace('.md', '');
                    
                    // Extract description from first paragraph or use default
                    const lines = content.split('\n');
                    let description = 'Documentation file';
                    for (let line of lines) {
                        const trimmed = line.trim();
                        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('**') && trimmed.length > 20) {
                            description = trimmed.substring(0, 150);
                            break;
                        }
                    }
                    
                    return {
                        filename: file,
                        title: title,
                        description: description,
                        path: `${category}/${file}`,
                        badge: badgeColors[category] || 'process'
                    };
                });
            
            if (files.length > 0) {
                docStructure[category] = {
                    title: categoryTitles[category] || category,
                    emoji: categoryEmojis[category] || '??',
                    files: files,
                    path: `docs/${category}/`,
                    isCompact: files.length > 6  // Use compact layout if more than 6 files
                };
                totalDocs += files.length;
            }
        } catch (err) {
            console.error(`Error reading category ${category}:`, err);
        }
    });
    
    // Root level docs (dynamically discovered)
    const processFiles = [];
    
    try {
        const rootFiles = fs.readdirSync(docsDir)
            .filter(file => file.endsWith('.md')); // Get all .md files in docs root
        
        rootFiles.forEach(file => {
            const filePath = path.join(docsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const titleMatch = content.match(/^#\s+(.+)$/m);
                const title = titleMatch ? titleMatch[1].replace(/[#??????????????????]/g, '').trim() : file.replace('.md', '');
                
                const lines = content.split('\n');
                let description = 'Process documentation';
                for (let line of lines) {
                    if (line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
                        description = line.substring(0, 150);
                        break;
                    }
                }
                
                processFiles.push({
                    filename: file,
                    title: title,
                    description: description,
                    path: file,
                    badge: 'process'
                });
            } catch (err) {
                console.error(`Error reading ${file}:`, err);
            }
        });
    } catch (err) {
        console.error('Error reading docs root directory:', err);
    }

    if (processFiles.length > 0) {
        docStructure['process'] = {
            title: 'Process & Workflow',
            emoji: '??',
            files: processFiles,
            path: 'docs/',
            isCompact: processFiles.length > 6
        };
        totalDocs += processFiles.length;
    }
    
    // Get current date for footer
    const lastUpdated = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
    });
    
    // Render Handlebars template
    res.render('documentation', {
        layout: null,  // Use standalone template (no layout wrapper)
        docStructure: docStructure,
        categories: Object.keys(docStructure),
        totalDocs: totalDocs,
        lastUpdated: lastUpdated
    });
});


/**
 * Documentation API - Dynamic Discovery
 * Returns JSON of all documentation files for dynamic loading
 */
router.get('/api/documentation', (req, res) => {
    const docsDir = path.join(__dirname, 'docs');
    
    // Whitelist of allowed categories (security measure)
    const allowedCategories = [
        'setup',
        'deployment',
        'git',
        'development',
        'archive',
        'summaries'
    ];
    
    const badgeColors = {
        setup: 'setup',
        deployment: 'deployment',
        git: 'git',
        development: 'dev',
        archive: 'archive',
        summaries: 'process'
    };
    
    const categoryEmojis = {
        setup: '??',
        deployment: '??',
        git: '??',
        development: '??',
        archive: '??',
        summaries: '??'
    };
    
    const categoryTitles = {
        setup: 'Setup & Installation',
        deployment: 'Deployment',
        git: 'Git Workflow',
        development: 'Development',
        archive: 'Archive (Historical)',
        summaries: 'Session Summaries'
    };
    
    // Discover documentation files
    let docStructure = {};
    
    allowedCategories.forEach(category => {
        const categoryPath = path.join(docsDir, category);
        
        // Security: Verify path is within docs folder
        if (!categoryPath.startsWith(docsDir)) {
            return; // Path traversal attempt, skip
        }
        
        // Check if directory exists
        if (!fs.existsSync(categoryPath)) {
            return; // Directory doesn't exist, skip
        }
        
        try {
            const files = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.md')) // Only .md files
                .map(file => {
                    const filePath = path.join(categoryPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Extract title from first # heading or use filename
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1].replace(/[#??????]/g, '').trim() : file.replace('.md', '');
                    
                    // Extract description from first paragraph or use default
                    const lines = content.split('\n');
                    let description = 'Documentation file';
                    for (let line of lines) {
                        if (line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
                            description = line.substring(0, 150);
                            break;
                        }
                    }
                    
                    return {
                        filename: file,
                        title: title,
                        description: description,
                        path: `${category}/${file}`,
                        badge: badgeColors[category] || 'process'
                    };
                });
            
            if (files.length > 0) {
                docStructure[category] = {
                    title: categoryTitles[category] || category,
                    emoji: categoryEmojis[category] || '??',
                    files: files,
                    path: `docs/${category}/`
                };
            }
        } catch (err) {
            console.error(`Error reading category ${category}:`, err);
        }
    });
    
    // Root level docs (dynamically discovered)
    const processFiles = [];
    
    try {
        const rootFiles = fs.readdirSync(docsDir)
            .filter(file => file.endsWith('.md')); // Get all .md files in docs root
        
        rootFiles.forEach(file => {
            const filePath = path.join(docsDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const titleMatch = content.match(/^#\s+(.+)$/m);
                const title = titleMatch ? titleMatch[1].replace(/[#??????]/g, '').trim() : file.replace('.md', '');
                
                const lines = content.split('\n');
                let description = 'Process documentation';
                for (let line of lines) {
                    if (line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
                        description = line.substring(0, 150);
                        break;
                    }
                }
                
                processFiles.push({
                    filename: file,
                    title: title,
                    description: description,
                    path: file,
                    badge: 'process'
                });
            } catch (err) {
                console.error(`Error reading ${file}:`, err);
            }
        });
    } catch (err) {
        console.error('Error reading docs root directory:', err);
    }

    if (processFiles.length > 0) {
        docStructure['process'] = {
            title: 'Process & Workflow',
            emoji: '??',
            files: processFiles,
            path: 'docs/'
        };
    }
    
    res.json(docStructure);
});


/**
 * Static Documentation Files
 * Serves markdown files and other documentation assets
 * Must come after specific routes to avoid conflicts
 */
router.use('/docs', express.static(path.join(__dirname, 'docs')));

/**
 * README Route
 * Serves the project README.md file
 */
router.get('/README.md', (req, res) => {
    res.sendFile(path.join(__dirname, 'README.md'));
});

module.exports = router;
