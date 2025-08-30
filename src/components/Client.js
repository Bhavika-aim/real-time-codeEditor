import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
  // fallback if username is undefined
  const displayName = username || 'Anonymous';
  return (
    <div className="client" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
      <Avatar name={displayName} size={40} round="14px" />
      <span className="userName" style={{ marginLeft: '8px' }}>{displayName}</span>
    </div>
  );
};

export default Client;
