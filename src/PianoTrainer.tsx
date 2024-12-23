import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useEffect, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { SplendidGrandPiano } from "smplr";
import "./App.css";
import { MIDI } from "./Midi";
import { PianoKeyboard } from "./PianoKeyboard";
import { Score } from "./Score";
import SettingsIcon from "@mui/icons-material/Settings";

const audioContext = new AudioContext();
const sound = new SplendidGrandPiano(audioContext);

function getRandomNote(range: [string, string]): string {
  const [lowestNote, highestNote] = range;
  const lowestIndex = MIDI.noteToIndex(lowestNote);
  const highestIndex = MIDI.noteToIndex(highestNote);
  const randomIndex = Math.floor(Math.random() * (highestIndex - lowestIndex)) + lowestIndex;
  const accidental = Math.random() < 0.5 ? "sharp" : "flat";
  return MIDI.indexToNote(randomIndex, accidental);
}

export const PianoTrainer = () => {
  const handle = useFullScreenHandle();

  const [noteRange, setNoteRange] = useState<[string, string]>(["C3", "C5"]);

  const [targetNote, setTargetNote] = useState<string>(() => getRandomNote(noteRange));
  const getNextNote = () => {
    while (true) {
      const nextNote = getRandomNote(noteRange);
      if (nextNote !== targetNote) {
        return nextNote;
      }
    }
  };
  const [correctNotesPlayed, setCorrectNotesPlayed] = useState(0);
  const [totalNotesPlayed, setTotalNotesPlayed] = useState(0);
  const [lastNoteWasCorrect, setLastNoteWasCorrect] = useState<boolean | undefined>();
  const [clef, setClef] = useState<string>("treble");

  useEffect(() => {
    setTargetNote(getRandomNote(noteRange));
  }, [noteRange]);

  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <dialog ref={modalRef}>
        <div className="controls">
          <h2 style={{ marginTop: 0 }}>Settings</h2>
          <div className="control">
            <label htmlFor="clef">Clef</label>
            <select id="clef" value={clef} onChange={(e) => setClef(e.target.value)}>
              <option value="treble">Treble</option>
              <option value="bass">Bass</option>
            </select>
          </div>
          <div className="control">
            <label htmlFor="minNote">Min</label>
            <select id="minNote" value={noteRange[0]} onChange={(e) => setNoteRange([e.target.value, noteRange[1]])}>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="C3">C3</option>
              <option value="C4">C4</option>
              <option value="C5">C5</option>
            </select>
          </div>

          <div className="control">
            <label htmlFor="maxNote">Max</label>
            <select id="maxNote" value={noteRange[1]} onChange={(e) => setNoteRange([noteRange[0], e.target.value])}>
              <option value="C3">C3</option>
              <option value="C4">C4</option>
              <option value="C5">C5</option>
              <option value="C6">C6</option>
            </select>
          </div>
        </div>
        <button
          style={{ float: "right" }}
          onClick={() => {
            modalRef.current?.close();
          }}
        >
          Ok
        </button>
      </dialog>
      <FullScreen handle={handle}>
        <button
          onClick={() => {
            if (handle.active) {
              handle.exit();
            } else {
              handle.enter();
            }
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: 5,
          }}
        >
          {handle.active ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </button>
        <button
          onClick={() => {
            modalRef.current?.showModal();
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 50,
            padding: 5,
          }}
        >
          <SettingsIcon />
        </button>
        <h2 style={{ position: "absolute", top: 10, left: 10, margin: 0 }}>
          {lastNoteWasCorrect === undefined ? `` : lastNoteWasCorrect ? `✔️` : `❌`} Accuracy: {correctNotesPlayed}/
          {totalNotesPlayed}
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "white",
            height: "100%",
          }}
        >
          <Score
            staves={[
              {
                clef,
                timeSignature: "1/4",
                voices: [[`${targetNote}/4`, { clef, stem: "down" }]],
              },
            ]}
            width={120}
            height={160}
          />
          <PianoKeyboard
            style={{ width: "100%", height: "auto", maxHeight: "70%" }}
            whiteKeyWidth={34} // TODO: Need to fit properly on all screensizes
            lowestNote={noteRange[0]}
            highestNote={noteRange[1]}
            onNoteDown={({ note }) => {
              audioContext.resume();
              sound.start(note);

              setTotalNotesPlayed((prev) => prev + 1);

              if (MIDI.noteToIndex(note) === MIDI.noteToIndex(targetNote)) {
                setCorrectNotesPlayed((prev) => prev + 1);
                setTargetNote(getNextNote());
                setLastNoteWasCorrect(true);
              } else {
                setLastNoteWasCorrect(false);
              }
            }}
          />
        </div>
      </FullScreen>
    </>
  );
};
