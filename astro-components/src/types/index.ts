// Core types for the Learning Lab components

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  objectives: string[];
  sections: Section[];
  estimatedTime?: string;
  prerequisites?: string[];
}

export interface Section {
  id: string;
  title: string;
  type: 'reading' | 'action' | 'reflection';
  content?: string;
  order?: number;
}

export interface Progress {
  [exerciseId: string]: {
    sections: {
      [sectionId: string]: {
        viewed: boolean;
        completed: boolean;
        viewedAt?: string;
        completedAt?: string;
      };
    };
    lastViewed?: string;
    completed?: boolean;
    completedAt?: string;
  };
}

export interface JourneyData {
  filesModified: string;
  biggestChallenge: string;
  keyCodeSnippet: string;
  patternsDiscovered: string;
  wouldDoDifferently: string;
  rating: number;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  timestamp: string;
  section: string;
  action: string;
}

export interface NavigationState {
  currentExercise: string | null;
  currentSection: string | null;
  showOverview: boolean;
  showJourney: boolean;
  showBehindScenes: boolean;
}

export interface CopyButtonProps {
  text: string;
  variant?: 'default' | 'primary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
  onCopy?: () => void;
}

export interface ProgressTrackerProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  showText?: boolean;
  className?: string;
}

export interface ExerciseCardProps {
  exercise: Exercise;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  onStart: (exerciseId: string) => void;
  onStartOver: (exerciseId: string) => void;
}

export interface SectionHeaderProps {
  title: string;
  type: Section['type'];
  difficulty?: Exercise['difficulty'];
  estimatedTime?: string;
  currentStep?: number;
  totalSteps?: number;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showCopyButton?: boolean;
  copyText?: string;
  className?: string;
}

export interface LearningObjectivesProps {
  objectives: string[];
  completedObjectives?: string[];
  className?: string;
}

export interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export interface ThemeToggleProps {
  initialTheme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  className?: string;
}

export interface TabManagerProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  defaultActiveTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export interface ExerciseInteractiveProps {
  exerciseId: string;
  sectionId: string;
  content: string;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: Progress;
}

// Event types
export interface CopyEvent {
  text: string;
  success: boolean;
  timestamp: number;
}

export interface NavigationEvent {
  from: string | null;
  to: string;
  type: 'exercise' | 'section';
  timestamp: number;
}

// Theme types
export type Theme = 'light' | 'dark';

// Utility types
export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed';
export type SectionType = 'reading' | 'action' | 'reflection';
export type ButtonVariant = 'default' | 'primary' | 'outline' | 'ghost' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

// Store types for Nanostores
export interface AppStore {
  exercises: Exercise[];
  currentExercise: string | null;
  currentSection: string | null;
  progress: Progress;
  journeyData: JourneyData;
  navigationState: NavigationState;
  theme: Theme;
}

// API types
export interface ExerciseManifest {
  exercises: Exercise[];
  version: string;
  lastUpdated: string;
}

export interface ContentResponse {
  content: string;
  metadata?: {
    wordCount: number;
    estimatedReadTime: number;
    lastModified: string;
  };
}