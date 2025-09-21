# New Astro Content Structure Design

## Overview

This document outlines the new content structure and routing design for the Astro-powered Learning Lab, replacing the current Alpine.js implementation with a more scalable, SEO-friendly, and performant solution.

## Content Collections Architecture

### 1. Exercises Collection (`/src/content/exercises/`)

**Purpose**: Exercise overview and metadata management

**File Structure**:
```
src/content/exercises/
├── 01-fundamentals.mdx
├── 02-multi-agent.mdx
├── 03-advanced.mdx
└── 04-production.mdx
```

**Routing**: `/exercises/[exercise-id]`
- `/exercises/01-fundamentals`
- `/exercises/02-multi-agent`
- `/exercises/03-advanced`
- `/exercises/04-production`

**Content Type**: Overview pages with exercise metadata, objectives, and section navigation

### 2. Sections Collection (`/src/content/sections/`)

**Purpose**: Individual exercise sections with detailed content

**File Structure**:
```
src/content/sections/
├── 01-fundamentals-overview.mdx
├── 01-fundamentals-concepts.mdx
├── 01-fundamentals-setup.mdx
├── 01-fundamentals-context-implementation.mdx
├── 01-fundamentals-agent-coordination.mdx
├── 01-fundamentals-validation.mdx
├── 01-fundamentals-reflection.mdx
├── 02-multi-agent-overview.mdx
└── [future sections...]
```

**Routing**: `/exercises/[exercise-id]/[section-id]`
- `/exercises/01-fundamentals/overview`
- `/exercises/01-fundamentals/concepts`
- `/exercises/01-fundamentals/setup`
- etc.

**Content Type**: Detailed learning content with copy buttons, transitions, and interactive elements

### 3. Knowledge Base Collection (`/src/content/knowledge-base/`)

**Purpose**: Patterns, templates, and reusable knowledge

**File Structure**:
```
src/content/knowledge-base/
├── patterns-context-management.mdx
├── patterns-context-inheritance-setup.mdx
├── templates-multi-agent-project-setup.mdx
├── templates-progressive-development-checklist.mdx
├── modules-module-2-strategic-scoping.mdx
├── prompting-patterns-strategic-scoping-patterns.mdx
└── [categorized content...]
```

**Routing**: `/knowledge-base/[category]/[item-id]` or `/knowledge-base/[item-id]`
- `/knowledge-base/patterns/context-management`
- `/knowledge-base/templates/multi-agent-project-setup`
- `/knowledge-base/modules/strategic-scoping`

**Content Type**: Reference documentation, patterns, templates, and guides

### 4. Meta Collection (`/src/content/meta/`)

**Purpose**: About, behind-the-scenes, and site-wide content

**File Structure**:
```
src/content/meta/
├── knowledge-base-overview.mdx
├── behind-the-scenes.mdx
├── about.mdx
└── [site-wide content...]
```

**Routing**: `/[meta-page]`
- `/behind-the-scenes`
- `/about`
- `/knowledge-base` (overview)

**Content Type**: Site-wide pages and documentation

## URL Structure and Routing

### Primary Navigation Routes

1. **Home Page**: `/`
   - Exercise catalog and overview
   - Progress dashboard
   - Quick access to continue learning

2. **Exercise Routes**: `/exercises/[exercise-id]`
   - Exercise overview and metadata
   - Section navigation
   - Progress tracking

3. **Section Routes**: `/exercises/[exercise-id]/[section-id]`
   - Detailed learning content
   - Copy button functionality
   - Navigation between sections

4. **Knowledge Base Routes**: `/knowledge-base/[item-id]`
   - Pattern and template documentation
   - Search and filtering capabilities
   - Cross-references and relationships

5. **Meta Routes**: `/[page-id]`
   - About, behind-the-scenes
   - Site documentation

### Dynamic Routing Implementation

```typescript
// src/pages/exercises/[exercise]/index.astro
export async function getStaticPaths() {
  const exercises = await getCollection('exercises');
  return exercises.map(exercise => ({
    params: { exercise: exercise.slug },
    props: { exercise }
  }));
}

// src/pages/exercises/[exercise]/[section].astro
export async function getStaticPaths() {
  const sections = await getCollection('sections');
  return sections.map(section => {
    const [exerciseId, sectionId] = section.slug.split('-', 2);
    return {
      params: {
        exercise: exerciseId,
        section: sectionId
      },
      props: { section }
    };
  });
}
```

## Content Relationships and Navigation

### 1. Exercise → Section Relationships

```typescript
// Get sections for an exercise
const exerciseSections = await getCollection('sections', ({ data }) => {
  return data.exerciseId === exerciseId;
});

// Sort by order
exerciseSections.sort((a, b) => a.data.order - b.data.order);
```

### 2. Cross-References in Knowledge Base

```typescript
// Get related patterns
const relatedPatterns = await getCollection('knowledge-base', ({ data }) => {
  return data.relatedPatterns?.includes(currentPatternId);
});
```

### 3. Progress Tracking Integration

```typescript
// Section navigation with progress
const sectionProgress = {
  current: currentSectionIndex,
  total: totalSections,
  completed: completedSections,
  next: nextSection,
  previous: previousSection
};
```

## Component Architecture

### 1. Layout Components

```astro
<!-- src/layouts/ExerciseLayout.astro -->
<Layout title={exercise.data.title}>
  <ExerciseHeader exercise={exercise} />
  <ProgressBar progress={progress} />
  <main>
    <slot />
  </main>
  <ExerciseNavigation sections={sections} current={currentSection} />
</Layout>
```

### 2. Content Components

```astro
<!-- src/components/CopyButton.astro -->
<div class="copy-button-container">
  <button
    class="copy-button"
    data-copy-text={copyText}
    onclick="copyToClipboard(this.dataset.copyText)"
  >
    📋 Copy
  </button>
</div>
```

### 3. Navigation Components

```astro
<!-- src/components/SectionNavigation.astro -->
<nav class="section-nav">
  {previousSection && (
    <a href={`/exercises/${exerciseId}/${previousSection.id}`}>
      ← Previous: {previousSection.title}
    </a>
  )}
  {nextSection && (
    <a href={`/exercises/${exerciseId}/${nextSection.id}`}>
      Next: {nextSection.title} →
    </a>
  )}
</nav>
```

## State Management and Interactivity

### 1. Progress Tracking (Client-Side)

```javascript
// src/scripts/progress.js
class ProgressManager {
  saveProgress(exerciseId, sectionId) {
    const progress = this.getProgress();
    if (!progress[exerciseId]) {
      progress[exerciseId] = { sections: {} };
    }
    progress[exerciseId].sections[sectionId] = {
      viewed: true,
      viewedAt: new Date().toISOString()
    };
    localStorage.setItem('learning-lab-progress', JSON.stringify(progress));
  }

  markCompleted(exerciseId, sectionId) {
    const progress = this.getProgress();
    progress[exerciseId].sections[sectionId].completed = true;
    progress[exerciseId].sections[sectionId].completedAt = new Date().toISOString();
    localStorage.setItem('learning-lab-progress', JSON.stringify(progress));
  }
}
```

### 2. Copy Button Functionality

```javascript
// src/scripts/copy-buttons.js
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess();
  }).catch(() => {
    fallbackCopy(text);
  });
}

function initializeCopyButtons() {
  document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const text = e.target.dataset.copyText;
      copyToClipboard(text);
    });
  });
}
```

### 3. Journey Tracking

```javascript
// src/scripts/journey.js
class JourneyTracker {
  addTimelineEntry(exerciseId, sectionId, action) {
    const journey = this.getJourney(exerciseId);
    journey.timeline.push({
      timestamp: new Date().toISOString(),
      section: sectionId,
      action: action
    });
    this.saveJourney(exerciseId, journey);
  }
}
```

## SEO and Performance Optimizations

### 1. Meta Tags and OpenGraph

```astro
---
// src/components/SEOHead.astro
const { title, description, image, type = 'website' } = Astro.props;
---

<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={type} />
<meta property="og:image" content={image} />
<meta name="twitter:card" content="summary_large_image" />
```

### 2. Structured Data

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": exercise.data.title,
  "description": exercise.data.description,
  "provider": {
    "@type": "Organization",
    "name": "Claude Multi-Agent Learning Lab"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "duration": exercise.data.duration
  }
})} />
```

### 3. Static Generation

All content will be statically generated at build time for optimal performance:

- Exercise pages: Pre-rendered with all metadata
- Section pages: Pre-rendered with content and navigation
- Knowledge base: Pre-rendered with search indexes
- Sitemap: Auto-generated from all collections

## Migration Benefits

### 1. Performance Improvements

- **Static Generation**: Faster loading than client-side rendering
- **Optimized Assets**: Automatic image optimization and bundling
- **Better Caching**: CDN-friendly static files
- **Reduced JavaScript**: No heavy client-side framework

### 2. SEO Benefits

- **Server-Side Rendering**: Content available to search engines
- **Structured URLs**: Clean, meaningful URLs for each section
- **Meta Tags**: Proper OpenGraph and Twitter cards
- **Sitemap**: Automatic sitemap generation

### 3. Developer Experience

- **Type Safety**: Full TypeScript support with schema validation
- **Hot Reloading**: Fast development with Astro's dev server
- **Component System**: Reusable Astro components
- **Content Validation**: Schema-based content validation

### 4. Content Management

- **Frontmatter Validation**: Catch errors at build time
- **Content Relationships**: Built-in relationship management
- **Search Capability**: Enhanced search with Fuse.js or similar
- **Versioning**: Git-based content versioning

## Implementation Timeline

1. **Phase 1**: Set up Astro project and content collections (1-2 hours)
2. **Phase 2**: Run migration scripts and validate content (30 minutes)
3. **Phase 3**: Build core components and layouts (2-3 hours)
4. **Phase 4**: Implement client-side functionality (1-2 hours)
5. **Phase 5**: Testing and refinement (1-2 hours)
6. **Phase 6**: Deploy and validate (30 minutes)

**Total Estimated Time**: 6-10 hours for complete migration

This structure provides a solid foundation for scaling the learning platform while maintaining all current functionality and improving performance, SEO, and maintainability.