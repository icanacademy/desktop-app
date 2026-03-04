document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('poetry-form');
    const themeInput = document.getElementById('theme');
    const gradeLevelSelect = document.getElementById('grade-level');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const emptyState = document.getElementById('empty-state');
    const poetryContent = document.getElementById('poetry-content');
    const outputPanel = document.getElementById('output-panel');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get values
        const theme = themeInput.value.trim();
        const gradeLevel = gradeLevelSelect.value;

        if (!theme || !gradeLevel) return;

        // UI Loading State
        setLoadingState(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theme: theme,
                    grade_level: gradeLevel
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Display Result
            displayPoetry(data.poetry);

        } catch (error) {
            console.error('Error generating poetry:', error);
            displayPoetry('Oops! Something went wrong while seeking inspiration. Please try again.');
        } finally {
            // Restore UI State
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.style.opacity = '0';
            btnLoader.style.display = 'block';
            generateBtn.disabled = true;
            generateBtn.style.cursor = 'not-allowed';
            
            // Fade out current content if any
            emptyState.style.display = 'none';
            poetryContent.style.opacity = '0.5';
        } else {
            btnText.style.opacity = '1';
            btnLoader.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.style.cursor = 'pointer';
            poetryContent.style.opacity = '1';
        }
    }

    function displayPoetry(text) {
        emptyState.style.display = 'none';
        
        // Reset animation
        poetryContent.style.animation = 'none';
        poetryContent.offsetHeight; // trigger reflow
        poetryContent.style.animation = null;
        
        poetryContent.style.display = 'block';
        poetryContent.textContent = text;
        
        // Ensure scrolling works if poem is long
        outputPanel.scrollTo(0, 0);
    }
});
