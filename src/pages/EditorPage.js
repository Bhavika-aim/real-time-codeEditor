import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Editor from '../components/Editor';

const EditorPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const user = { name: location.state?.username || 'Anonymous' };

  return <Editor roomId={roomId} user={user} />;
};

export default EditorPage;
