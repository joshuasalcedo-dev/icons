document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const resizer = document.getElementById('resizer');
    const contentArea = document.getElementById('content-area');
    const treeContainer = document.getElementById('tree-container');
    const contentContainer = document.getElementById('content-container');
    const searchInput = document.getElementById('search');

    let isResizing = false;

    // Initialize resizer functionality
    initResizer();

    // Initialize search functionality
    initSearch();

    /**
     * Render tree structure recursively
     */
    function renderTree(node, container) {
        const ul = document.createElement('ul');

        node.children.forEach(child => {
            const li = document.createElement('li');
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            nodeDiv.dataset.path = child.path;
            nodeDiv.dataset.type = child.type;

            // Create toggle button for folders
            if (child.type === 'directory') {
                const toggle = document.createElement('span');
                toggle.className = 'toggle';
                toggle.innerHTML = '▶';
                toggle.onclick = function(e) {
                    e.stopPropagation();
                    const childList = li.querySelector('ul');
                    if (childList) {
                        childList.style.display = childList.style.display === 'none' ? 'block' : 'none';
                        toggle.classList.toggle('open');
                    }
                };
                nodeDiv.appendChild(toggle);

                // Set icon for folder
                const icon = document.createElement('img');
                icon.className = 'icon';
                icon.src = "https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg";
                icon.alt = 'Folder';
                nodeDiv.appendChild(icon);
            } else {
                // Set icon for file based on extension
                const icon = document.createElement('img');
                icon.className = 'icon';
                icon.src = getDevIcon(child.name);
                icon.alt = 'File';
                nodeDiv.appendChild(icon);
            }

            // Add name
            const name = document.createElement('span');
            name.textContent = child.name;
            nodeDiv.appendChild(name);

            // Add click event
            nodeDiv.onclick = function() {
                // Remove selected class from all nodes
                document.querySelectorAll('.tree-node.selected').forEach(node => {
                    node.classList.remove('selected');
                });

                // Add selected class to clicked node
                nodeDiv.classList.add('selected');

                // Display path and file info in content area
                showFileInfo(child);
            };

            li.appendChild(nodeDiv);

            // Render children if any
            if (child.children && child.children.length > 0) {
                renderTree(child, li);
            }

            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    /**
     * Show file information in the content area
     */
    function showFileInfo(file) {
        contentContainer.innerHTML = '';

        // Create a container for file info
        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.className = 'file-info';

        // Add file path
        const pathDiv = document.createElement('div');
        pathDiv.className = 'file-path';
        pathDiv.textContent = `Path: ${file.path}`;
        fileInfoDiv.appendChild(pathDiv);

        // Add file name with icon
        const nameDiv = document.createElement('div');
        nameDiv.className = 'file-name';

        const icon = document.createElement('img');
        icon.src = file.type === 'directory'
            ? "https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg"
            : getDevIcon(file.name);
        nameDiv.appendChild(icon);

        const name = document.createElement('h2');
        name.textContent = file.name;
        nameDiv.appendChild(name);

        fileInfoDiv.appendChild(nameDiv);

        // If it's a file (not a directory), try to load its content
        if (file.type !== 'directory') {
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading';
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            loadingDiv.appendChild(spinner);
            fileInfoDiv.appendChild(loadingDiv);

            // Fetch file content
            fetch(`http://localhost:8989/file?path=${encodeURIComponent(file.path)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(content => {
                    // Remove loading indicator
                    fileInfoDiv.removeChild(loadingDiv);

                    // Create content display
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'code-content';
                    contentDiv.textContent = content;
                    fileInfoDiv.appendChild(contentDiv);
                })
                .catch(error => {
                    // Remove loading indicator
                    fileInfoDiv.removeChild(loadingDiv);

                    // Show error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'file-note';
                    errorDiv.innerHTML = `
                        <p>Error loading file content: ${error.message}</p>
                        <p>Make sure the server is running and the file is accessible.</p>
                    `;
                    fileInfoDiv.appendChild(errorDiv);
                });
        } else {
            // For directories, show a note
            const noteDiv = document.createElement('div');
            noteDiv.className = 'file-note';
            noteDiv.innerHTML = `
                <p>This is a directory. Select a file to view its content.</p>
            `;
            fileInfoDiv.appendChild(noteDiv);
        }

        contentContainer.appendChild(fileInfoDiv);
    }

    /**
     * Get appropriate DevIcon for file based on extension
     */
    function getDevIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const baseUrl = "https://raw.githubusercontent.com/devicons/devicon/master/icons";

        // Map extensions to appropriate DevIcons
        const iconMap = {
            // Programming Languages
            'js': `${baseUrl}/javascript/javascript-original.svg`,
            'jsx': `${baseUrl}/react/react-original.svg`,
            'ts': `${baseUrl}/typescript/typescript-original.svg`,
            'tsx': `${baseUrl}/react/react-original.svg`,
            'html': `${baseUrl}/html5/html5-original.svg`,
            'htm': `${baseUrl}/html5/html5-original.svg`,
            'css': `${baseUrl}/css3/css3-original.svg`,
            'scss': `${baseUrl}/sass/sass-original.svg`,
            'less': `${baseUrl}/less/less-plain-wordmark.svg`,
            'java': `${baseUrl}/java/java-original.svg`,
            'py': `${baseUrl}/python/python-original.svg`,
            'rb': `${baseUrl}/ruby/ruby-original.svg`,
            'php': `${baseUrl}/php/php-original.svg`,
            'c': `${baseUrl}/c/c-original.svg`,
            'h': `${baseUrl}/c/c-original.svg`,
            'cpp': `${baseUrl}/cplusplus/cplusplus-original.svg`,
            'hpp': `${baseUrl}/cplusplus/cplusplus-original.svg`,
            'cs': `${baseUrl}/csharp/csharp-original.svg`,
            'go': `${baseUrl}/go/go-original.svg`,
            'rs': `${baseUrl}/rust/rust-plain.svg`,
            'swift': `${baseUrl}/swift/swift-original.svg`,
            'kt': `${baseUrl}/kotlin/kotlin-original.svg`,
            'scala': `${baseUrl}/scala/scala-original.svg`,
            'dart': `${baseUrl}/dart/dart-original.svg`,
            'ex': `${baseUrl}/elixir/elixir-original.svg`,
            'exs': `${baseUrl}/elixir/elixir-original.svg`,
            'lua': `${baseUrl}/lua/lua-original.svg`,
            'r': `${baseUrl}/r/r-original.svg`,
            'pl': `${baseUrl}/perl/perl-original.svg`,
            'clj': `${baseUrl}/clojure/clojure-original.svg`,
            'elm': `${baseUrl}/elm/elm-original.svg`,
            'haskell': `${baseUrl}/haskell/haskell-original.svg`,
            'hs': `${baseUrl}/haskell/haskell-original.svg`,

            // Framework specific
            'vue': `${baseUrl}/vuejs/vuejs-original.svg`,
            'svelte': `${baseUrl}/svelte/svelte-original.svg`,
            'angular': `${baseUrl}/angularjs/angularjs-original.svg`,
            'component.ts': `${baseUrl}/angular/angular-original.svg`,
            'module.ts': `${baseUrl}/angular/angular-original.svg`,
            'service.ts': `${baseUrl}/angular/angular-original.svg`,

            // Data formats
            'json': `${baseUrl}/json/json-plain.svg`,
            'xml': `${baseUrl}/xml/xml-original.svg`,
            'yaml': `${baseUrl}/yaml/yaml-original.svg`,
            'yml': `${baseUrl}/yaml/yaml-original.svg`,
            'toml': `${baseUrl}/plain/plain-original.svg`,
            'csv': `${baseUrl}/plain/plain-original.svg`,

            // Configuration files
            'gitignore': `${baseUrl}/git/git-original.svg`,
            'npmrc': `${baseUrl}/npm/npm-original-wordmark.svg`,
            'babelrc': `${baseUrl}/babel/babel-original.svg`,
            'eslintrc': `${baseUrl}/eslint/eslint-original.svg`,
            'dockerignore': `${baseUrl}/docker/docker-original.svg`,
            'dockerfile': `${baseUrl}/docker/docker-original.svg`,

            // Images
            'jpg': `${baseUrl}/plain/plain-original.svg`,
            'jpeg': `${baseUrl}/plain/plain-original.svg`,
            'png': `${baseUrl}/plain/plain-original.svg`,
            'gif': `${baseUrl}/plain/plain-original.svg`,
            'svg': `${baseUrl}/plain/plain-original.svg`,
            'webp': `${baseUrl}/plain/plain-original.svg`,

            // Documents
            'pdf': `${baseUrl}/plain/plain-original.svg`,
            'md': `${baseUrl}/markdown/markdown-original.svg`,
            'txt': `${baseUrl}/plain/plain-original.svg`,
            'doc': `${baseUrl}/plain/plain-original.svg`,
            'docx': `${baseUrl}/plain/plain-original.svg`,
            'xls': `${baseUrl}/plain/plain-original.svg`,
            'xlsx': `${baseUrl}/plain/plain-original.svg`,
            'ppt': `${baseUrl}/plain/plain-original.svg`,
            'pptx': `${baseUrl}/plain/plain-original.svg`,

            // Build tools and package management
            'gradle': `${baseUrl}/gradle/gradle-plain.svg`,
            'pom.xml': `${baseUrl}/maven/maven-plain.svg`,
            'package.json': `${baseUrl}/npm/npm-original-wordmark.svg`,
            'package-lock.json': `${baseUrl}/npm/npm-original-wordmark.svg`,
            'yarn.lock': `${baseUrl}/yarn/yarn-original.svg`,
            'gulpfile.js': `${baseUrl}/gulp/gulp-plain.svg`,
            'webpack.config.js': `${baseUrl}/webpack/webpack-original.svg`,

            // Default for unknown
            'default': `${baseUrl}/plain/plain-original.svg`
        };

        // Special case handling for certain filenames
        if (filename.toLowerCase() === 'dockerfile') {
            return `${baseUrl}/docker/docker-original.svg`;
        }

        if (filename.toLowerCase() === 'package.json') {
            return `${baseUrl}/npm/npm-original-wordmark.svg`;
        }

        if (filename.toLowerCase() === 'readme.md') {
            return `${baseUrl}/markdown/markdown-original.svg`;
        }

        // Check for file patterns
        if (filename.endsWith('.component.ts') || filename.endsWith('.module.ts') || filename.endsWith('.service.ts')) {
            return `${baseUrl}/angular/angular-original.svg`;
        }

        if (filename.endsWith('.test.js') || filename.endsWith('.spec.js')) {
            return `${baseUrl}/jest/jest-plain.svg`;
        }

        // Look for the extension in our map
        return iconMap[extension] || iconMap['default'];
    }

    /**
     * Initialize resizer functionality
     */
    function initResizer() {
        resizer.addEventListener('mousedown', function(e) {
            isResizing = true;
            document.body.classList.add('resizing');
        });

        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;

            // Calculate new width (with min/max constraints)
            const newWidth = e.clientX;
            const minWidth = 200;
            const maxWidth = window.innerWidth * 0.5;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                sidebar.style.width = newWidth + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isResizing = false;
            document.body.classList.remove('resizing');
        });
    }

    /**
     * Initialize search functionality
     */
    function initSearch() {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            // Filter visible nodes based on search term
            const treeNodes = document.querySelectorAll('.tree-node');
            treeNodes.forEach(node => {
                const nodeName = node.querySelector('span:last-child').textContent.toLowerCase();
                const nodeParent = node.closest('li');

                if (nodeName.includes(searchTerm)) {
                    // Show nodes that match
                    nodeParent.style.display = 'block';

                    // Ensure all parent folders are expanded
                    let parent = nodeParent.parentElement;
                    while (parent && parent !== treeContainer) {
                        if (parent.tagName === 'UL') {
                            parent.style.display = 'block';
e
                            // Find the parent's toggle button and update it
                            const parentLi = parent.closest('li');
                            if (parentLi) {
                                const toggle = parentLi.querySelector('.toggle');
                                if (toggle) toggle.classList.add('open');
                            }
                        }
                        parent = parent.parentElement;
                    }
                } else {
                    // Hide nodes that don't match (but only if search is active)
                    if (searchTerm) {
                        nodeParent.style.display = 'none';
                    } else {
                        nodeParent.style.display = 'block';
                    }
                }
            });
        });
    }
});