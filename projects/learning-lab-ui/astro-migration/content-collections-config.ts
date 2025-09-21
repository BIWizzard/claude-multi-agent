// src/content/config.ts - Astro Content Collections Configuration
import { defineCollection, z } from 'astro:content';

// Exercise Collection Schema
const exercisesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic exercise metadata
    id: z.string(),
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),

    // Learning objectives and prerequisites
    objectives: z.array(z.string()),
    prerequisites: z.array(z.string()),

    // Exercise structure
    sections: z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['reading', 'action', 'validation', 'reflection']),
      estimatedTime: z.string(),
      description: z.string(),
    })),

    // Metadata
    version: z.string().default('1.0.0'),
    lastUpdated: z.date(),
    tags: z.array(z.string()).optional(),
    authorNotes: z.string().optional(),

    // SEO and UI
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  })
});

// Section Collection Schema
const sectionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Section metadata
    exerciseId: z.string(),
    sectionId: z.string(),
    title: z.string(),
    type: z.enum(['reading', 'action', 'validation', 'reflection']),
    estimatedTime: z.string(),
    description: z.string(),
    order: z.number(),

    // Content features
    hasCopyButton: z.boolean().default(false),
    copyButtonText: z.string().optional(),
    hasCodeSnippets: z.boolean().default(false),
    hasTransition: z.boolean().default(false),
    transitionTarget: z.enum(['claude-code', 'web']).optional(),

    // Learning elements
    objectives: z.array(z.string()).optional(),
    successCriteria: z.array(z.string()).optional(),
    commonMistakes: z.array(z.string()).optional(),
    tips: z.array(z.string()).optional(),

    // Navigation
    previousSection: z.string().optional(),
    nextSection: z.string().optional(),
    relatedSections: z.array(z.string()).optional(),

    // Metadata
    lastUpdated: z.date(),
    authorNotes: z.string().optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    tags: z.array(z.string()).optional(),
  })
});

// Knowledge Base Collection Schema
const knowledgeBaseCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Content classification
    type: z.enum(['pattern', 'template', 'troubleshooting', 'tool-guide']),
    category: z.string(),
    title: z.string(),
    description: z.string(),

    // Pattern metadata (for patterns)
    problemContext: z.string().optional(),
    solutionApproach: z.string().optional(),
    whenToUse: z.array(z.string()).optional(),
    whenToAvoid: z.array(z.string()).optional(),

    // Template metadata (for templates)
    templateType: z.string().optional(),
    setupInstructions: z.array(z.string()).optional(),
    customizationNotes: z.string().optional(),

    // Troubleshooting metadata
    symptoms: z.array(z.string()).optional(),
    causes: z.array(z.string()).optional(),
    solutions: z.array(z.string()).optional(),
    preventionTips: z.array(z.string()).optional(),

    // Common metadata
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    tags: z.array(z.string()),
    relatedPatterns: z.array(z.string()).optional(),
    codeExamples: z.boolean().default(false),
    lastUpdated: z.date(),
    version: z.string().default('1.0.0'),

    // Usage tracking
    usageContext: z.array(z.string()).optional(),
    implementationNotes: z.string().optional(),
    testingNotes: z.string().optional(),
  })
});

// Meta Content Collection (for behind-the-scenes, about, etc.)
const metaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['about', 'behind-scenes', 'guide', 'reference']),
    showInNavigation: z.boolean().default(false),
    order: z.number().default(0),
    lastUpdated: z.date(),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
});

// Export collections
export const collections = {
  'exercises': exercisesCollection,
  'sections': sectionsCollection,
  'knowledge-base': knowledgeBaseCollection,
  'meta': metaCollection,
};

// Type exports for TypeScript
export type Exercise = z.infer<typeof exercisesCollection.schema>;
export type Section = z.infer<typeof sectionsCollection.schema>;
export type KnowledgeBase = z.infer<typeof knowledgeBaseCollection.schema>;
export type Meta = z.infer<typeof metaCollection.schema>;