import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
interface AnimatedButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  to,
  onClick,
  children,
  variant = 'primary',
  className = '',
  type = 'button'
}) => {
  // Button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'btn btn-primary';
      case 'secondary':
        return 'btn btn-secondary';
      case 'outline':
        return 'btn btn-outline btn-primary';
      default:
        return 'btn btn-primary';
    }
  };
  const buttonClasses = `${getButtonStyles()} ${className}`;
  // Render either a Link or a button
  if (to) {
    return <motion.div whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }} transition={{
      type: 'spring',
      stiffness: 400,
      damping: 17
    }}>
        <Link to={to} className={buttonClasses}>
          {children}
        </Link>
      </motion.div>;
  }
  return <motion.button type={type} onClick={onClick} className={buttonClasses} whileHover={{
    scale: 1.05
  }} whileTap={{
    scale: 0.95
  }} transition={{
    type: 'spring',
    stiffness: 400,
    damping: 17
  }}>
      {children}
    </motion.button>;
};