import {Uri} from 'monaco-editor';

interface EditorModel {
  value: string;
  language?: string;
  uri?: Uri;
}

export {EditorModel};
