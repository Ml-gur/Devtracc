export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  taskTitle: string;
  taskDescription?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  tags?: string[];
  category: 'development' | 'design' | 'testing' | 'documentation' | 'meeting' | 'research' | 'other';
  createdAt: string;
  isDefault?: boolean;
  usageCount?: number;
}

export const TEMPLATE_CATEGORIES = {
  development: { label: 'Development', icon: '💻', color: 'bg-blue-100 text-blue-800' },
  design: { label: 'Design', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
  testing: { label: 'Testing', icon: '🧪', color: 'bg-green-100 text-green-800' },
  documentation: { label: 'Documentation', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
  meeting: { label: 'Meeting', icon: '🤝', color: 'bg-orange-100 text-orange-800' },
  research: { label: 'Research', icon: '🔍', color: 'bg-indigo-100 text-indigo-800' },
  other: { label: 'Other', icon: '📋', color: 'bg-gray-100 text-gray-800' }
};

export const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: 'template-feature',
    name: 'Feature Implementation',
    description: 'Template for implementing new features',
    taskTitle: 'Implement [Feature Name]',
    taskDescription: 'Develop and implement the [Feature Name] functionality including:\n- Requirements analysis\n- Code implementation\n- Unit testing\n- Documentation',
    priority: 'medium',
    estimatedHours: 4,
    tags: ['feature', 'development'],
    category: 'development',
    createdAt: new Date().toISOString(),
    isDefault: true,
    usageCount: 0
  },
  {
    id: 'template-bug-fix',
    name: 'Bug Fix',
    description: 'Template for fixing bugs',
    taskTitle: 'Fix: [Bug Description]',
    taskDescription: 'Investigation and resolution of bug:\n- Reproduce the issue\n- Identify root cause\n- Implement fix\n- Test solution\n- Update documentation if needed',
    priority: 'high',
    estimatedHours: 2,
    tags: ['bugfix', 'maintenance'],
    category: 'development',
    createdAt: new Date().toISOString(),
    isDefault: true,
    usageCount: 0
  },
  {
    id: 'template-design-review',
    name: 'Design Review',
    description: 'Template for design review tasks',
    taskTitle: 'Design Review: [Component/Feature]',
    taskDescription: 'Review and provide feedback on:\n- Visual design consistency\n- User experience flow\n- Accessibility considerations\n- Implementation feasibility',
    priority: 'medium',
    estimatedHours: 1,
    tags: ['design', 'review'],
    category: 'design',
    createdAt: new Date().toISOString(),
    isDefault: true,
    usageCount: 0
  },
  {
    id: 'template-testing',
    name: 'Testing Suite',
    description: 'Template for creating test suites',
    taskTitle: 'Create tests for [Component/Feature]',
    taskDescription: 'Develop comprehensive test coverage:\n- Unit tests\n- Integration tests\n- Edge case testing\n- Performance testing\n- Documentation updates',
    priority: 'medium',
    estimatedHours: 3,
    tags: ['testing', 'quality'],
    category: 'testing',
    createdAt: new Date().toISOString(),
    isDefault: true,
    usageCount: 0
  },
  {
    id: 'template-docs',
    name: 'Documentation',
    description: 'Template for documentation tasks',
    taskTitle: 'Document [Feature/Process]',
    taskDescription: 'Create comprehensive documentation:\n- Technical specifications\n- User guides\n- API documentation\n- Code comments\n- Examples and tutorials',
    priority: 'low',
    estimatedHours: 2,
    tags: ['documentation', 'knowledge'],
    category: 'documentation',
    createdAt: new Date().toISOString(),
    isDefault: true,
    usageCount: 0
  },
  {
    id: 'template-research',
    name: 'Research Task',
    description: 'Template for research and investigation',
    taskTitle: 'Research: [Topic/Technology]',
    taskDescription: 'Research and investigation:\n- Literature review\n- Technology evaluation\n- Proof of concept\n- Findings documentation\n- Recommendations',
    priority: 'medium',
    estimatedHours: 4,
    tags: ['research', 'analysis'],
    category: 'research',
    createdAt: new Date().toISOString(),
    isDefault: true,
    usageCount: 0
  }
];