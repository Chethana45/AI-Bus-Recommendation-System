import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', animated = true, ...props }) => {
  const baseClassName =
    'rounded-[24px] border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,6,23,0.45)]';

  if (!animated) {
    return (
      <div className={`${baseClassName} ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`${baseClassName} ${className}`.trim()}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
