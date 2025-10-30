export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web_development' | 'mobile_app' | 'api_backend' | 'data_science' | 'game_development' | 'other';
  techStack: string[];
  estimatedDuration: number; // in days
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  tasks: ProjectTemplateTask[];
  tags: string[];
  isDefault: boolean;
  usageCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplateTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  status: 'todo' | 'in_progress' | 'completed';
  position: number;
  dependencies?: string[]; // IDs of tasks that must be completed first
  category?: string;
  tags?: string[];
}

export interface ProjectFromTemplate {
  templateId: string;
  projectName: string;
  projectDescription?: string;
  customizations: {
    skipTasks?: string[];
    modifyTasks?: { [taskId: string]: Partial<ProjectTemplateTask> };
    additionalTasks?: Omit<ProjectTemplateTask, 'id'>[];
  };
}

export const TEMPLATE_CATEGORIES = {
  web_development: {
    label: 'Web Development',
    icon: '🌐',
    color: 'bg-blue-100 text-blue-800',
    description: 'Frontend and full-stack web applications'
  },
  mobile_app: {
    label: 'Mobile App',
    icon: '📱',
    color: 'bg-green-100 text-green-800',
    description: 'iOS, Android, and cross-platform mobile apps'
  },
  api_backend: {
    label: 'API & Backend',
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'REST APIs, GraphQL, and backend services'
  },
  data_science: {
    label: 'Data Science',
    icon: '📊',
    color: 'bg-purple-100 text-purple-800',
    description: 'ML models, data analysis, and visualization'
  },
  game_development: {
    label: 'Game Development',
    icon: '🎮',
    color: 'bg-red-100 text-red-800',
    description: '2D/3D games and interactive experiences'
  },
  other: {
    label: 'Other',
    icon: '📦',
    color: 'bg-gray-100 text-gray-800',
    description: 'Custom projects and unique solutions'
  }
};