import { IssueCategory, IssuePriority } from './types';

// Keywords for category detection
const categoryKeywords: Record<IssueCategory, string[]> = {
  roads: ['pothole', 'road', 'street', 'pavement', 'asphalt', 'crack', 'sidewalk', 'curb', 'crosswalk', 'traffic', 'sign'],
  sanitation: ['garbage', 'trash', 'waste', 'litter', 'bin', 'dump', 'smell', 'odor', 'pest', 'rat', 'cockroach', 'dirty', 'overflow'],
  utilities: ['light', 'streetlight', 'lamp', 'electricity', 'power', 'water', 'hydrant', 'sewer', 'drain', 'cable', 'wire', 'leak', 'flooding'],
  'public-safety': ['vandal', 'graffiti', 'broken', 'damage', 'suspicious', 'unsafe', 'crime', 'abandoned', 'vehicle', 'safety'],
  parks: ['park', 'playground', 'bench', 'tree', 'grass', 'garden', 'swing', 'slide', 'trail', 'recreation', 'fountain'],
  other: [],
};

// Keywords for priority detection
const highPriorityKeywords = ['urgent', 'emergency', 'dangerous', 'hazard', 'immediate', 'critical', 'severe', 'major', 'children', 'injured', 'flooding', 'fire'];
const mediumPriorityKeywords = ['broken', 'damage', 'unsafe', 'overflow', 'leak', 'dark', 'blocked'];

/**
 * Auto-categorizes an issue based on its description using keyword matching
 */
export function categorizeIssue(description: string): IssueCategory {
  const lowerDesc = description.toLowerCase();
  
  let bestCategory: IssueCategory = 'other';
  let highestScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (lowerDesc.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > highestScore) {
      highestScore = score;
      bestCategory = category as IssueCategory;
    }
  }

  return bestCategory;
}

/**
 * Auto-assigns priority based on keywords in the description
 */
export function assignPriority(description: string): IssuePriority {
  const lowerDesc = description.toLowerCase();

  // Check for high priority keywords
  for (const keyword of highPriorityKeywords) {
    if (lowerDesc.includes(keyword)) {
      return 'high';
    }
  }

  // Check for medium priority keywords
  for (const keyword of mediumPriorityKeywords) {
    if (lowerDesc.includes(keyword)) {
      return 'medium';
    }
  }

  return 'low';
}

/**
 * Generates a suggested title based on category and key phrases
 */
export function generateTitle(description: string, category: IssueCategory): string {
  const categoryTitles: Record<IssueCategory, string> = {
    roads: 'Road/Infrastructure Issue',
    sanitation: 'Sanitation Issue',
    utilities: 'Utilities Issue',
    'public-safety': 'Public Safety Concern',
    parks: 'Parks & Recreation Issue',
    other: 'General Issue',
  };

  // Try to extract first meaningful sentence
  const sentences = description.split(/[.!?]/);
  if (sentences[0] && sentences[0].trim().length > 10 && sentences[0].trim().length < 60) {
    return sentences[0].trim();
  }

  return categoryTitles[category];
}
