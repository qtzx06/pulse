import { motion } from 'framer-motion';
import NeuroShaderCanvas from './NeuroShaderCanvas';
import './MobileView.css';

const MobileView = () => {
  return (
    <div className="mobile-app">
      <motion.div
        className="shader-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <NeuroShaderCanvas />
      </motion.div>
      <div className="mobile-content">
        <motion.p
          className="mobile-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          please use desktop.
        </motion.p>
      </div>
    </div>
  );
};

export default MobileView;
