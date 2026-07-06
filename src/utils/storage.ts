import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types';
import { WELCOME_NOTE_TITLE, WELCOME_NOTE_CONTENT } from './constants';

const STORAGE_KEY = 'notebook_markdown_notes';

// Helper to generate UUID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const getNotes = async (): Promise<Note[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedNotes: Note[] = JSON.parse(data);
      // Sort by updatedAt descending
      return parsedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
    } else {
      // Initialize with welcome note
      const welcomeNote: Note = {
        id: 'welcome',
        title: WELCOME_NOTE_TITLE,
        content: WELCOME_NOTE_CONTENT,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveNotes([welcomeNote]);
      return [welcomeNote];
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const saveNotes = async (notes: Note[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    return false;
  }
};

export const saveNote = async (note: { id?: string; title: string; content: string; createdAt?: number }): Promise<Note> => {
  try {
    const notes = await getNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    
    let updatedNote: Note;
    if (existingIndex > -1) {
      // Update
      const oldNote = notes[existingIndex];
      updatedNote = {
        ...oldNote,
        title: note.title,
        content: note.content,
        updatedAt: Date.now(),
      };
      notes[existingIndex] = updatedNote;
    } else {
      // Create new
      updatedNote = {
        id: note.id || generateId(),
        title: note.title,
        content: note.content,
        createdAt: note.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      notes.push(updatedNote);
    }
    
    await saveNotes(notes);
    return updatedNote;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

export const deleteNote = async (id: string): Promise<Note[]> => {
  try {
    const notes = await getNotes();
    const filteredNotes = notes.filter(n => n.id !== id);
    
    // If we delete all notes, it would auto-generate the welcome note again on getNotes.
    // So if the list is empty, we save empty list explicitly.
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
    return filteredNotes;
  } catch (error) {
    console.error('Error deleting note:', error);
    return [];
  }
};

export interface AppSettings {
  holdToDelete: boolean;
  swipeToDelete: boolean;
}

const SETTINGS_KEY = 'notebook_markdown_settings';

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
  return {
    holdToDelete: true,
    swipeToDelete: true,
  };
};

export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

