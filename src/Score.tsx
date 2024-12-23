import { useEffect, useRef } from "react";
import { Flow } from "vexflow";

export type StaveRepresentation = {
  voices: [string, { clef?: string; stem?: string }][];
  clef?: string;
  timeSignature?: string;
};

// export type NoteRepresentation = string | [string, number];
export type ScoreProps = {
  staves: StaveRepresentation[];
  timeSignature?: string;
  width?: number;
  height?: number;
  // ref?: RefObject<Renderer>;
  style?: React.CSSProperties;
};

export function Score({ staves = [], timeSignature = "4/4", width = 450, height = 150, style }: ScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // useImperativeHandle(
  //   ref,
  //   () => {
  //     (note: NoteRepresentation) => {
  //       new StaveNote({
  //         keys: key ? [key] : keys,
  //         duration: String(duration),
  //       });
  //     };
  //   },
  //   []
  // );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    // @ts-expect-error VexFlow types are incomplete
    const vf = new Flow.Factory({ renderer: { elementId: container, width, height } });
    const score = vf.EasyScore();
    const system = vf.System();

    for (const { voices, clef, timeSignature } of staves) {
      const stave = system.addStave({
        voices: voices.map(([notes, options]) => score.voice(score.notes(notes, options), { time: timeSignature })),
      });

      if (clef) {
        stave.addClef(clef);
      }
      if (timeSignature) {
        stave.addTimeSignature(timeSignature);
      }
      system.addConnector("singleLeft");
    }

    vf.draw();
  }, [staves, timeSignature, width, height]);

  return <div ref={containerRef} style={style} />;
}
