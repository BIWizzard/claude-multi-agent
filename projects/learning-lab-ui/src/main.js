import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  sanitize: false, // Allow HTML in markdown
  smartypants: false,
  pedantic: false
});

// Global copy function for prompt buttons
window.copyPromptText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show success feedback
    alert('✅ Prompt copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ Prompt copied to clipboard!');
  });
};

// Global Alpine.js data function
window.learningLab = function() {
  return {
    // State
    exercises: [],
    currentExercise: null,
    currentSection: null,
    currentExerciseData: null,
    currentSectionContent: '',
    showOverview: false,
    showBehindScenes: false,
    showJourney: false,
    behindScenesContent: '',
    progress: {},
    journeyData: {
      filesModified: '',
      biggestChallenge: '',
      keyCodeSnippet: '',
      patternsDiscovered: '',
      wouldDoDifferently: '',
      rating: 0,
      timeline: []
    },
    showCopySuccess: false,
    
    // Computed properties
    get progressText() {
      if (!this.currentExercise) return '';
      const completed = this.getCompletedSections().length;
      const total = this.currentExerciseData?.sections?.length || 0;
      return `${completed} of ${total} sections`;
    },
    
    get progressPercent() {
      if (!this.currentExercise) return 0;
      const completed = this.getCompletedSections().length;
      const total = this.currentExerciseData?.sections?.length || 0;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    },
    
    get hasPreviousSection() {
      return this.getCurrentSectionIndex() > 0;
    },
    
    get hasNextSection() {
      const current = this.getCurrentSectionIndex();
      const total = this.currentExerciseData?.sections?.length || 0;
      return current < total - 1;
    },
    
    get isLastSection() {
      const current = this.getCurrentSectionIndex();
      const total = this.currentExerciseData?.sections?.length || 0;
      return current === total - 1;
    },
    
    get canProceed() {
      // For now, always allow proceeding
      // Can add validation logic here later
      return true;
    },

    // Initialization
    async init() {
      await this.loadExercises();
      this.loadProgress();
      await this.loadBehindScenes();
      
      // Check if we should resume an exercise
      const urlParams = new URLSearchParams(window.location.search);
      const exerciseId = urlParams.get('exercise');
      const sectionId = urlParams.get('section');
      
      if (exerciseId) {
        await this.startExercise(exerciseId);
        if (sectionId) {
          this.navigateToSection(sectionId);
        }
      }
    },
    
    async loadExercises() {
      try {
        // Load exercise manifest
        const response = await fetch('/exercises/manifest.json');
        const data = await response.json();
        this.exercises = data.exercises;
      } catch (error) {
        console.error('Failed to load exercises:', error);
        // Fallback to demo data
        this.exercises = this.getDemoExercises();
      }
    },
    
    loadProgress() {
      const saved = localStorage.getItem('learning-lab-progress');
      this.progress = saved ? JSON.parse(saved) : {};
    },
    
    saveProgress() {
      localStorage.setItem('learning-lab-progress', JSON.stringify(this.progress));
    },

    async loadBehindScenes() {
      try {
        const response = await fetch('/src/behind-the-scenes.md');
        if (response.ok) {
          const content = await response.text();
          const rawHtml = marked(content);
          this.behindScenesContent = DOMPurify.sanitize(rawHtml);
        }
      } catch (error) {
        console.error('Failed to load behind the scenes content:', error);
        this.behindScenesContent = '<p>Behind the scenes content is loading...</p>';
      }
    },
    
    // Exercise management
    async startExercise(exerciseId) {
      this.currentExercise = exerciseId;
      this.showOverview = false;
      
      // Load exercise data
      this.currentExerciseData = this.exercises.find(ex => ex.id === exerciseId);
      
      if (!this.currentExerciseData) {
        console.error('Exercise not found:', exerciseId);
        return;
      }
      
      // Load exercise content
      await this.loadExerciseContent();

      // Load journey data
      this.loadJourneyData();

      // Navigate to first incomplete section or first section
      const lastSection = this.getLastViewedSection(exerciseId);
      const firstIncomplete = this.getFirstIncompleteSection(exerciseId);

      this.navigateToSection(lastSection || firstIncomplete || this.currentExerciseData.sections[0].id);
      
      // Update URL
      this.updateURL();
    },
    
    async loadExerciseContent() {
      // Load markdown content for each section
      for (const section of this.currentExerciseData.sections) {
        if (!section.content) {
          try {
            // Map exercise ID to folder name
            const folderName = this.currentExercise === '01-fundamentals' ? '01-fundamentals' : this.currentExercise;
            const response = await fetch(`/exercises/${folderName}/${section.id}.md`);
            if (response.ok) {
              section.content = await response.text();
            } else {
              section.content = this.getFallbackContent(section);
            }
          } catch (error) {
            console.error(`Failed to load section ${section.id}:`, error);
            section.content = this.getFallbackContent(section);
          }
        }
      }
    },
    
    navigateToSection(sectionId) {
      this.currentSection = sectionId;
      const section = this.currentExerciseData.sections.find(s => s.id === sectionId);
      
      if (section) {
        // Render markdown content
        const rawHtml = marked(section.content || '');
        // Use DOMPurify for content
        this.currentSectionContent = DOMPurify.sanitize(rawHtml);

        // Mark as viewed
        this.markSectionViewed(sectionId);

        // Update URL
        this.updateURL();

        // Scroll to top
        window.scrollTo(0, 0);

        // Post-process to add copy buttons after DOM updates
        this.$nextTick(() => {
          this.addCopyButtons();
        });
      }
    },
    
    previousSection() {
      const currentIndex = this.getCurrentSectionIndex();
      if (currentIndex > 0) {
        const prevSection = this.currentExerciseData.sections[currentIndex - 1];
        this.navigateToSection(prevSection.id);
      }
    },
    
    nextSection() {
      const currentIndex = this.getCurrentSectionIndex();
      const total = this.currentExerciseData.sections.length;
      
      if (currentIndex < total - 1) {
        // Mark current section as completed
        this.markSectionCompleted(this.currentSection);
        
        const nextSection = this.currentExerciseData.sections[currentIndex + 1];
        this.navigateToSection(nextSection.id);
      }
    },
    
    completeExercise() {
      // Mark current section and exercise as completed
      this.markSectionCompleted(this.currentSection);
      this.markExerciseCompleted(this.currentExercise);
      
      // Show completion message and return to overview
      alert('🎉 Congratulations! You\'ve completed this exercise!');
      this.showOverview = true;
    },
    
    // Progress tracking
    markSectionViewed(sectionId) {
      if (!this.progress[this.currentExercise]) {
        this.progress[this.currentExercise] = { sections: {}, lastViewed: null };
      }
      
      this.progress[this.currentExercise].lastViewed = sectionId;
      
      if (!this.progress[this.currentExercise].sections[sectionId]) {
        this.progress[this.currentExercise].sections[sectionId] = {
          viewed: true,
          viewedAt: new Date().toISOString()
        };
      }
      
      this.saveProgress();
    },
    
    markSectionCompleted(sectionId) {
      if (!this.progress[this.currentExercise]) {
        this.progress[this.currentExercise] = { sections: {} };
      }
      
      this.progress[this.currentExercise].sections[sectionId] = {
        ...this.progress[this.currentExercise].sections[sectionId],
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      this.saveProgress();
    },
    
    markExerciseCompleted(exerciseId) {
      if (!this.progress[exerciseId]) {
        this.progress[exerciseId] = { sections: {} };
      }
      
      this.progress[exerciseId].completed = true;
      this.progress[exerciseId].completedAt = new Date().toISOString();
      
      this.saveProgress();
    },
    
    // Helper methods
    getCurrentSectionIndex() {
      return this.currentExerciseData?.sections?.findIndex(s => s.id === this.currentSection) || 0;
    },
    
    getCompletedSections() {
      if (!this.currentExercise || !this.progress[this.currentExercise]) return [];
      const sections = this.progress[this.currentExercise].sections || {};
      return Object.keys(sections).filter(id => sections[id].completed);
    },
    
    getLastViewedSection(exerciseId) {
      return this.progress[exerciseId]?.lastViewed;
    },
    
    getFirstIncompleteSection(exerciseId) {
      if (!this.currentExerciseData) return null;
      
      const sections = this.progress[exerciseId]?.sections || {};
      return this.currentExerciseData.sections.find(section => 
        !sections[section.id]?.completed
      )?.id;
    },
    
    isSectionCompleted(sectionId) {
      return this.progress[this.currentExercise]?.sections?.[sectionId]?.completed || false;
    },
    
    getSectionIcon(sectionId) {
      if (this.currentSection === sectionId) return '▶️';
      if (this.isSectionCompleted(sectionId)) return '✅';
      return '○';
    },
    
    getExerciseStatus(exerciseId) {
      if (this.progress[exerciseId]?.completed) return 'completed';
      if (this.progress[exerciseId]?.sections && Object.keys(this.progress[exerciseId].sections).length > 0) return 'in-progress';
      return 'not-started';
    },
    
    getExerciseProgress(exerciseId) {
      const exercise = this.exercises.find(ex => ex.id === exerciseId);
      if (!exercise) return 0;
      
      const sections = this.progress[exerciseId]?.sections || {};
      const completed = Object.keys(sections).filter(id => sections[id].completed).length;
      const total = exercise.sections?.length || 0;
      
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    },
    
    getActionText(exerciseId) {
      const status = this.getExerciseStatus(exerciseId);
      switch (status) {
        case 'completed': return 'Review Exercise';
        case 'in-progress': return 'Continue';
        default: return 'Start Exercise';
      }
    },
    
    updateURL() {
      const params = new URLSearchParams();
      if (this.currentExercise) {
        params.set('exercise', this.currentExercise);
        if (this.currentSection) {
          params.set('section', this.currentSection);
        }
      }
      
      const newURL = params.toString() ? `?${params.toString()}` : '/';
      window.history.replaceState({}, '', newURL);
    },
    
    getFallbackContent(section) {
      return `# ${section.title}\n\nContent for this section is being loaded...\n\nPlease check back soon or refer to the exercise materials in the repository.`;
    },
    
    getDemoExercises() {
      return [
        {
          id: '01-fundamentals',
          title: 'Claude Code Fundamentals',
          description: 'Master project structure and context management for multi-agent workflows',
          duration: '2 hours',
          difficulty: 'Beginner',
          objectives: [
            'Understand hierarchical context management',
            'Create agent isolation patterns',
            'Implement session handoff procedures',
            'Build reusable project templates'
          ],
          sections: [
            {
              id: 'overview',
              title: 'Exercise Overview',
              type: 'reading'
            },
            {
              id: 'setup',
              title: 'Project Setup',
              type: 'action'
            },
            {
              id: 'context-management',
              title: 'Context Management',
              type: 'action'
            },
            {
              id: 'testing',
              title: 'Testing & Validation',
              type: 'action'
            },
            {
              id: 'reflection',
              title: 'Knowledge Extraction',
              type: 'reflection'
            }
          ]
        }
      ];
    },

    // Journey tracking methods
    getTimeSpent() {
      const exerciseProgress = this.progress[this.currentExercise];
      if (!exerciseProgress) return '0 min';

      const sections = exerciseProgress.sections || {};
      const times = Object.values(sections)
        .map(s => s.viewedAt || s.completedAt)
        .filter(Boolean)
        .map(t => new Date(t).getTime());

      if (times.length < 2) return '< 5 min';

      const totalMs = Math.max(...times) - Math.min(...times);
      const minutes = Math.round(totalMs / 60000);

      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const remainingMin = minutes % 60;
      return `${hours}h ${remainingMin}m`;
    },

    getRatingText() {
      const ratings = {
        0: 'Not rated',
        1: '⭐ Needs improvement',
        2: '⭐⭐ Getting there',
        3: '⭐⭐⭐ Good work!',
        4: '⭐⭐⭐⭐ Excellent!',
        5: '⭐⭐⭐⭐⭐ Outstanding!'
      };
      return ratings[this.journeyData.rating] || 'Not rated';
    },

    addTimelineEntry(action) {
      this.journeyData.timeline.push({
        timestamp: new Date().toISOString(),
        section: this.currentExerciseData?.sections?.find(s => s.id === this.currentSection)?.title || 'Unknown',
        action: action
      });
      this.saveJourneyData();
    },

    saveJourney() {
      this.saveJourneyData();
      alert('✅ Journey saved successfully!');
    },

    saveJourneyData() {
      const journeyKey = `journey-${this.currentExercise}`;
      localStorage.setItem(journeyKey, JSON.stringify(this.journeyData));
    },

    loadJourneyData() {
      const journeyKey = `journey-${this.currentExercise}`;
      const saved = localStorage.getItem(journeyKey);
      if (saved) {
        this.journeyData = { ...this.journeyData, ...JSON.parse(saved) };
      }
    },

    exportJourney() {
      const exercise = this.currentExerciseData;
      const exportData = {
        exercise: exercise.title,
        completed: new Date().toLocaleDateString(),
        progress: `${this.progressPercent}% (${this.getCompletedSections().length}/${exercise.sections.length} sections)`,
        timeSpent: this.getTimeSpent(),
        rating: this.getRatingText(),
        ...this.journeyData
      };

      const content = `# Implementation Journey: ${exercise.title}

**Completed:** ${exportData.completed}
**Progress:** ${exportData.progress}
**Time Spent:** ${exportData.timeSpent}
**Rating:** ${exportData.rating}

## Files Modified
${exportData.filesModified || 'Not specified'}

## Biggest Challenge
${exportData.biggestChallenge || 'Not specified'}

## Key Code Snippet
\`\`\`
${exportData.keyCodeSnippet || 'Not provided'}
\`\`\`

## Patterns Discovered
${exportData.patternsDiscovered || 'Not specified'}

## What I'd Do Differently
${exportData.wouldDoDifferently || 'Not specified'}

## Implementation Timeline
${exportData.timeline.map(entry =>
  `- **${this.formatTime(entry.timestamp)}** ${entry.section}: ${entry.action}`
).join('\n')}

---
*Generated by Claude Multi-Agent Learning Lab*`;

      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journey-${this.currentExercise}.md`;
      a.click();
      URL.revokeObjectURL(url);
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Start Over functionality
    startOver(exerciseId) {
      if (confirm('🔄 Are you sure you want to start this exercise over? This will reset all progress and clear your journey documentation.')) {
        // Clear progress data
        delete this.progress[exerciseId];
        this.saveProgress();

        // Clear journey data
        const journeyKey = `journey-${exerciseId}`;
        localStorage.removeItem(journeyKey);

        // Reset journey data in memory
        this.journeyData = {
          filesModified: '',
          biggestChallenge: '',
          keyCodeSnippet: '',
          patternsDiscovered: '',
          wouldDoDifferently: '',
          rating: 0,
          timeline: []
        };

        // If currently in this exercise, restart it
        if (this.currentExercise === exerciseId) {
          this.currentSection = null;
          this.currentSectionContent = '';
          this.showJourney = false;
          this.showOverview = false;

          // Start fresh
          this.startExercise(exerciseId);
        }

        alert('✅ Exercise reset successfully! Starting fresh.');
      }
    },

    // Copy functionality for starter prompts
    copyStarterPrompt(promptText) {
      navigator.clipboard.writeText(promptText).then(() => {
        // Show success feedback
        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 2000);
      });
    },

    // Post-process to add copy buttons
    addCopyButtons() {
      const sectionContent = document.querySelector('.section-content');
      if (!sectionContent) {
        console.log('No section content found');
        return;
      }

      console.log('Section content found, checking for markers...');
      const originalHTML = sectionContent.innerHTML;

      // Find all [COPY_BUTTON] markers
      const copyMarkers = originalHTML.split('[COPY_BUTTON]');
      console.log('Copy markers found:', copyMarkers.length - 1);

      if (copyMarkers.length > 1) {
        console.log('Processing copy button markers...');

        // Simple approach: find the most recent code block and add button after it
        const codeBlocks = sectionContent.querySelectorAll('code');
        console.log('Code blocks found:', codeBlocks.length);

        if (codeBlocks.length > 0) {
          // Get the first code block (which should be our starter prompt)
          const firstCodeBlock = codeBlocks[0];
          const promptText = firstCodeBlock.textContent.trim();
          console.log('Prompt text found:', promptText.substring(0, 50) + '...');

          // Create copy button
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'starter-prompt-container';
          buttonContainer.innerHTML = `
            <button
              class="copy-button"
              onclick="window.copyPromptText(\`${promptText.replace(/`/g, '\\`')}\`)"
            >
              📋 Copy
            </button>
          `;

          // Insert after the code block's parent paragraph
          const codeParent = firstCodeBlock.closest('p') || firstCodeBlock.parentElement;
          if (codeParent && codeParent.nextSibling) {
            codeParent.parentNode.insertBefore(buttonContainer, codeParent.nextSibling);
          } else if (codeParent) {
            codeParent.parentNode.appendChild(buttonContainer);
          }

          console.log('Copy button added successfully');
        }
      }
    }
  };
};