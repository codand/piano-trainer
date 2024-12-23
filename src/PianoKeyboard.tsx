import { ComponentProps, CSSProperties, useEffect, useRef, useState } from "react";
import { MIDI } from "./Midi";

export type PianoKeyboardProps = {
  style?: CSSProperties;
  lowestNote?: string;
  highestNote?: string;
  whiteKeyWidth?: number;
  whiteKeyHeight?: number;
  blackKeyWidth?: number;
  blackKeyHeight?: number;
  hoverColor?: string;
  onNoteDown?: (event: PianoKeyboardEvent) => void;
  onNoteUp?: (event: PianoKeyboardEvent) => void;
};

export type PianoKeyboardEvent = {
  note: string;
};

const QWERTY_MAP: Record<string, string> = {
  KeyQ: "c4",
  Digit2: "c#4",
  KeyW: "d4",
  Digit3: "d#4",
  KeyE: "e4",
  KeyR: "f4",
  Digit5: "f#4",
  KeyT: "g4",
  Digit6: "g#4",
  KeyY: "a4",
  Digit7: "a#4",
  KeyU: "b4",
  KeyI: "c5",
};

export const PianoKeyboard = ({
  style,
  lowestNote = "C1",
  highestNote = "C8",
  whiteKeyWidth = 23,
  whiteKeyHeight = 149,
  blackKeyWidth = 15,
  blackKeyHeight = 100,
  hoverColor = "green",
  onNoteDown,
  onNoteUp,
}: PianoKeyboardProps) => {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  const pressedKeyRef = useRef<string | null>(null);

  const renderKeys = () => {
    const whiteKeys = [];
    const blackKeys = [];
    for (let i = MIDI.noteToIndex(lowestNote); i <= MIDI.noteToIndex(highestNote); i++) {
      const note = MIDI.indexToNote(i);
      // TODO: Breaks on the 10th octave
      if (note.length === 2) {
        whiteKeys.push(
          <use
            key={note}
            id={note}
            href="#white-key"
            x={whiteKeys.length * whiteKeyWidth}
            y={0}
            fill={hoveredNote === note ? hoverColor : "white"}
          />
        );
      } else {
        blackKeys.push(
          <use
            key={note}
            id={note}
            href="#black-key"
            x={whiteKeys.length * whiteKeyWidth - blackKeyWidth / 2}
            y={0}
            fill={hoveredNote === note ? hoverColor : "black"}
          />
        );
      }
    }

    return [...whiteKeys, ...blackKeys];
  };

  const totalWhiteKeys = Array.from({
    length: MIDI.noteToIndex(highestNote) - MIDI.noteToIndex(lowestNote) + 1,
  }).filter((_, i) => MIDI.indexToNote(MIDI.noteToIndex(lowestNote) + i).length === 2).length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const note = QWERTY_MAP[e.code];
      if (note) {
        setHoveredNote(note);
        onNoteDown?.({ note });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onNoteDown]);

  return (
    <svg
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWhiteKeys * whiteKeyWidth} ${whiteKeyHeight}`}
      onPointerOver={(e) => {
        const note = (e.target as SVGElement).id;
        if (pressedKeyRef.current) {
          onNoteUp?.({ note: pressedKeyRef.current });
          onNoteDown?.({ note });
        }
        setHoveredNote(note);
      }}
      onPointerLeave={(e) => {
        setHoveredNote(null);
        pressedKeyRef.current = null;
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        const note = (e.target as SVGElement).id;
        pressedKeyRef.current = note;
        onNoteDown?.({ note });
      }}
      onPointerUp={(e) => {
        const note = (e.target as SVGElement).id;
        onNoteUp?.({ note });
        pressedKeyRef.current = null;
      }}
    >
      <defs>
        <rect id="white-key" width={whiteKeyWidth} height={whiteKeyHeight} rx="2.4" ry="4.8" stroke="black" />
        <rect id="black-key" width={blackKeyWidth} height={blackKeyHeight} rx="2.4" ry="4.8" />
      </defs>

      {renderKeys()}
    </svg>
  );
};
