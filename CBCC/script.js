document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generation-form');
    const topicInput = document.getElementById('topic');
    const generateBtn = document.getElementById('generate-btn');
    const errorMessage = document.getElementById('error-message');
    
    const loadingState = document.getElementById('loading-state');
    const resultPanel = document.getElementById('result-panel');
    const materialContent = document.getElementById('material-content');
    const resultSubtitle = document.getElementById('result-subtitle');
    const newMaterialBtn = document.getElementById('new-material-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const featuresFooter = document.getElementById('features-footer');

    // Helper to switch views
    const setView = (view) => {
        loadingState.style.display = 'none';
        resultPanel.style.display = 'none';
        form.parentElement.style.display = 'block'; // Show form container by default
        featuresFooter.style.display = 'none';
        errorMessage.style.display = 'none';
        errorMessage.innerHTML = '';

        if (view === 'loading') {
            loadingState.style.display = 'block';
            form.parentElement.style.display = 'none';
            featuresFooter.style.display = 'none';
        } else if (view === 'result') {
            resultPanel.style.display = 'block';
            form.parentElement.style.display = 'none';
            featuresFooter.style.display = 'none';
        } else {
            // Default/Home view
            form.parentElement.style.display = 'block';
            featuresFooter.style.display = 'grid';
        }
    };

    // Function to transform the markdown string into HTML
    const formatMarkdown = (text) => {
        if (!text) return '';
        
        // This is a minimal markdown to HTML conversion based on the original React logic
        // It relies on CSS classes defined in style.css for styling the tags
        return text
            // Handle headings
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            // Handle bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Handle italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Handle list items (simple approach for the original -)
            .replace(/- (.*)/g, '<li>$1</li>')
            // Handle paragraphs/newlines
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');
    };

    // --- Generate Handler ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!topicInput.value.trim()) {
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = 'Please enter a topic';
            return;
        }

        const formData = {
            grade: document.getElementById('grade').value,
            subject: document.getElementById('subject').value,
            topic: topicInput.value,
            materialType: document.getElementById('materialType').value,
            constraints: document.getElementById('constraints').value,
        };

        setView('loading');
        generateBtn.disabled = true;

        try {
            // Replace with your actual backend URL
            const response = await fetch('http://localhost:3000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Generation failed');
            
            const data = await response.json();
            const formattedContent = formatMarkdown(data.content);
            
            // Set result data
            materialContent.innerHTML = formattedContent;
            resultSubtitle.textContent = `${formData.grade} • ${formData.subject} • ${formData.materialType}`;

            setView('result');

        } catch (err) {
            errorMessage.style.display = 'block';
            errorMessage.innerHTML = 'Failed to generate material. Please check your connection and try again.';
            setView('home'); // Go back to form view on error
            console.error(err);
        } finally {
            generateBtn.disabled = false;
        }
    });

    // --- New Material Handler ---
    newMaterialBtn.addEventListener('click', () => {
        setView('home');
        // Clear result content
        materialContent.innerHTML = '';
        // Optionally reset form data here if needed, but for simplicity, we keep the previous inputs.
    });

    // --- Download/Print Handler ---
    downloadPdfBtn.addEventListener('click', () => {
        const grade = document.getElementById('grade').value;
        const topic = topicInput.value;
        const resultHTML = materialContent.innerHTML;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>CBC Material - ${topic}</title>
                    <style>
                        /* Print styles matching the original React component */
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 40px; 
                            line-height: 1.8; 
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        h1 { color: #1e40af; font-size: 24px; margin-top: 20px; }
                        h2 { color: #2563eb; font-size: 20px; margin-top: 18px; }
                        h3 { color: #3b82f6; font-size: 16px; margin-top: 15px; }
                        strong { font-weight: 600; }
                        li { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    ${resultHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });

    // Set initial view
    setView('home');
});