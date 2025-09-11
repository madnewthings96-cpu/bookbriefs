
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500" style={{borderColor: '#FF7F50', borderTopColor: 'transparent', borderBottomColor: 'transparent'}}></div>
    </div>
  );
};

export default Spinner;
