import React, { useEffect, useRef } from 'react'
import codemirror from 'codemirror'
import 'codemirror/theme/dracula.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets'
import ACTIONS from '../Action';


const Editor = ({ socketRef, roomId, onCodeChange }) => {
  console.log("socketRef", socketRef.current)
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      editorRef.current.on('change', (instance, changes) => {
        console.log('changes', changes);
        const { origin } = changes;

        const code = instance.getValue();
        onCodeChange(code)
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          })
        }

      })

    }

    init();

  }, [])

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      })
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }
  }, [socketRef.current]);

  return (
    <textarea id="realtimeEditor"></textarea>
  )
}

export default Editor;
