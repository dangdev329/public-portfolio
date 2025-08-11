import { useState } from '#imports'
export const useActiveSection = () => useState<string>('activeSection', () => 'home')
