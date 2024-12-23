/* prettier-ignore */
const NOTE_TO_INDEX: Record<string, number> = {
  "C": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "F": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "A#": 10,
  "Bb": 10,
  "B": 11,
};

const INDEX_TO_NOTE_FLAT: Record<number, string> = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "Gb",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
};

const INDEX_TO_NOTE_SHARP: Record<number, string> = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B",
};

const NOTES_PER_OCTAVE = 12;

export class MIDI {
  /**
   * Returns the MIDI index of a note.
   */
  static noteToIndex(note: string): number {
    const pitch = note[0] + (note.length > 2 ? note[1] : "");
    const octave = parseInt(note[note.length - 1]);

    return NOTE_TO_INDEX[pitch] + NOTES_PER_OCTAVE * (octave + 1);
  }

  static indexToNote(index: number, accidentalPreference: "sharp" | "flat" = "sharp"): string {
    const octave = Math.floor(index / NOTES_PER_OCTAVE) - 1;
    const pitch = index % NOTES_PER_OCTAVE;
    if (accidentalPreference === "sharp") {
      return INDEX_TO_NOTE_SHARP[pitch] + octave;
    } else {
      return INDEX_TO_NOTE_FLAT[pitch] + octave;
    }
  }
}
