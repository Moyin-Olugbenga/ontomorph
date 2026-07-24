import { OrganHealth } from '@/app/types';

export const ORGAN_SHAPES = {
  brain: {
    geometry: 'sphere',
    scale: [1, 0.9, 0.9],
    color: '#E8D5B7'
  },
  heart: {
    geometry: 'heart',
    scale: [1, 1, 0.8],
    color: '#FF6B6B'
  },
  lungs: {
    geometry: 'capsule',
    scale: [1.2, 1, 0.6],
    color: '#FF8A9B'
  },
  liver: {
    geometry: 'sphere',
    scale: [1.1, 0.6, 0.8],
    color: '#8B4513'
  },
  kidneys: {
    geometry: 'bean',
    scale: [0.8, 1, 0.6],
    color: '#CD853F'
  },
  stomach: {
    geometry: 'sphere',
    scale: [0.8, 1.2, 0.6],
    color: '#D4A574'
  },
  intestines: {
    geometry: 'torus',
    scale: [1.2, 0.8, 0.6],
    color: '#C4956A'
  },
  spine: {
    geometry: 'cylinder',
    scale: [0.3, 1.5, 0.3],
    color: '#E8E0D0'
  }
};

export const DEFAULT_ORGANS: OrganHealth[] = [
  {
    id: 'brain',
    name: 'Brain',
    status: 'healthy',
    explanation: 'Normal cognitive function. No neurological concerns.',
    position: [0, 2.0, 0],  // Moved up
    size: 1.2  // Increased size
  },
  {
    id: 'heart',
    name: 'Heart',
    status: 'healthy',
    explanation: 'Normal cardiac rhythm and function.',
    position: [-0.8, 0.8, 0.3],  // Adjusted position
    size: 1.0  // Increased size
  },
  {
    id: 'lungs',
    name: 'Lungs',
    status: 'healthy',
    explanation: 'Normal respiratory function. No signs of distress.',
    position: [0.9, 0.8, 0],  // Adjusted position
    size: 1.1  // Increased size
  },
  {
    id: 'liver',
    name: 'Liver',
    status: 'healthy',
    explanation: 'Normal hepatic function. Enzyme levels within range.',
    position: [0.7, -0.3, 0.8],  // Adjusted position
    size: 1.0  // Increased size
  },
  {
    id: 'stomach',
    name: 'Stomach',
    status: 'healthy',
    explanation: 'Normal digestive function.',
    position: [-0.5, -0.2, 1.0],  // Adjusted position
    size: 0.9  // Increased size
  },
  {
    id: 'kidneys',
    name: 'Kidneys',
    status: 'healthy',
    explanation: 'Normal renal function. Filtration rate is optimal.',
    position: [-0.9, -0.2, 0.4],  // Adjusted position
    size: 0.8  // Increased size
  },
  {
    id: 'intestines',
    name: 'Intestines',
    status: 'healthy',
    explanation: 'Normal digestive function.',
    position: [0.5, -0.8, 0.6],  // Adjusted position
    size: 0.9  // Increased size
  },
  {
    id: 'spine',
    name: 'Spine',
    status: 'healthy',
    explanation: 'Normal spinal alignment and function.',
    position: [0, -0.3, -1.0],  // Moved forward so it's visible
    size: 0.7  // Increased size
  }
];

export const ORGAN_STATUS_COLORS = {
  healthy: '#4CAF50',
  'at-risk': '#FF9800',
  affected: '#F44336'
} as const;

export const ORGAN_STATUS_LABELS = {
  healthy: 'Healthy',
  'at-risk': 'At Risk',
  affected: 'Affected'
} as const;