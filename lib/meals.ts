import { MealConfig } from './types'

export const MEALS: MealConfig[] = [
  { id: 'ranajky',  label: 'Raňajky',      time: '7:00 – 9:00',   icon: '☕', color: '#BA7517', bg: '#FAEEDA' },
  { id: 'desiata',  label: 'Desiata',       time: '10:00 – 11:00', icon: '🍎', color: '#3B6D11', bg: '#EAF3DE' },
  { id: 'obed',     label: 'Obed',          time: '12:00 – 14:00', icon: '🍽️', color: '#0F6E56', bg: '#E1F5EE' },
  { id: 'olovrant', label: 'Olovrant',      time: '15:00 – 16:30', icon: '🥨', color: '#534AB7', bg: '#EEEDFE' },
  { id: 'vecera',   label: 'Večera',        time: '18:00 – 20:00', icon: '🍳', color: '#993C1D', bg: '#FAECE7' },
  { id: 'dvecera',  label: 'Druhá večera',  time: 'po 20:00',      icon: '🌙', color: '#185FA5', bg: '#E6F1FB' },
]
