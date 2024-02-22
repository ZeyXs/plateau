import { createContext } from 'react';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { socket } = require('../socket');

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;