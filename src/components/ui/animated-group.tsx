'use client';

import { Children, useMemo } from 'react';
import type { ReactNode } from 'react';
import { motion, type Variant } from 'motion/react';

type MotionStateVariants = {
  hidden: Variant;
  visible: Variant;
};

export type PresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'blur'
  | 'blur-slide'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing';

export type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Partial<MotionStateVariants>;
    item?: Partial<MotionStateVariants>;
  };
  preset?: PresetType;
};

const defaultContainerVariants: MotionStateVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants: MotionStateVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const presetVariants: Record<PresetType, Partial<MotionStateVariants>> = {
  fade: {},
  slide: {
    hidden: { y: 20 },
    visible: { y: 0 },
  },
  scale: {
    hidden: { scale: 0.8 },
    visible: { scale: 1 },
  },
  blur: {
    hidden: { filter: 'blur(4px)' },
    visible: { filter: 'blur(0px)' },
  },
  'blur-slide': {
    hidden: { filter: 'blur(4px)', y: 20 },
    visible: { filter: 'blur(0px)', y: 0 },
  },
  zoom: {
    hidden: { scale: 0.5 },
    visible: {
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
  flip: {
    hidden: { rotateX: -90 },
    visible: {
      rotateX: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  },
  bounce: {
    hidden: { y: -50 },
    visible: {
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },
  rotate: {
    hidden: { rotate: -180 },
    visible: {
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  },
  swing: {
    hidden: { rotate: -10 },
    visible: {
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 8 },
    },
  },
};

const mergeVariants = (
  base: MotionStateVariants,
  overrides?: Partial<MotionStateVariants>
): MotionStateVariants => ({
  hidden: { ...base.hidden, ...(overrides?.hidden ?? {}) },
  visible: { ...base.visible, ...(overrides?.visible ?? {}) },
});

function AnimatedGroup({ children, className, variants, preset }: AnimatedGroupProps) {
  const containerVariants = useMemo(
    () => mergeVariants(defaultContainerVariants, variants?.container),
    [variants?.container]
  );

  const baseItemVariants = useMemo(() => (
    preset ? mergeVariants(defaultItemVariants, presetVariants[preset]) : { ...defaultItemVariants }
  ), [preset]);

  const itemVariants = useMemo(
    () => mergeVariants(baseItemVariants, variants?.item),
    [baseItemVariants, variants?.item]
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export { AnimatedGroup };
